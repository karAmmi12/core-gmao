/**
 * Implémentation Groq du service IA - Couche Infrastructure
 * Peut être remplacé facilement par Claude, OpenAI, etc. sans toucher aux use cases
 */

import Groq from 'groq-sdk';
import { AIService, ChatRequest, ChatResponse } from '@/core/domain/services/AIService';
import { AIToolService, ToolDefinition } from '@/core/domain/services/AIToolService';

export class GroqAIService implements AIService {
  private groq: Groq;

  constructor(
    apiKey: string,
    private toolService?: AIToolService
  ) {
    this.groq = new Groq({ apiKey });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Générer le contexte système
      const systemContext = await this.generateSystemContext(request.userId, request.userRole);

      // Ajouter le message système en premier
      const messages = [
        { role: 'system' as const, content: systemContext },
        ...request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      // Préparer les tools si disponibles
      const tools = this.toolService 
        ? this.convertToolsToGroqFormat(this.toolService.getAvailableTools(request.userRole))
        : undefined;

      // Appel à l'API Groq avec function calling
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // Modèle mis à jour (janvier 2026)
        messages,
        temperature: request.temperature || 0.5,
        max_tokens: request.maxTokens || 1024,
        tools,
        tool_choice: tools ? 'auto' : undefined,
      });

      const choice = completion.choices[0];

      // Si l'IA veut appeler un outil
      if (choice.message.tool_calls && this.toolService) {
        const toolCalls = choice.message.tool_calls;
        const toolResults = [];

        console.log('🤖 AI requested tool calls:', toolCalls.map(tc => tc.function.name));

        // Exécuter chaque outil demandé
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function.name;
          const toolParams = JSON.parse(toolCall.function.arguments);

          console.log(`🔧 Executing tool: ${toolName}`, toolParams);

          const result = await this.toolService.executeTool(
            toolName,
            toolParams,
            { userId: request.userId, userRole: request.userRole }
          );

          console.log(`✅ Tool result:`, result);

          toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool' as const,
            name: toolName,
            content: JSON.stringify(result),
          });
        }

        // Ajouter les résultats et demander la réponse finale
        messages.push(choice.message as any);
        messages.push(...toolResults as any);

        const finalCompletion = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: request.temperature || 0.5,
          max_tokens: request.maxTokens || 1024,
        });

        return {
          message: finalCompletion.choices[0]?.message?.content || 'Pas de réponse disponible',
          tokensUsed: (completion.usage?.total_tokens || 0) + (finalCompletion.usage?.total_tokens || 0),
          model: finalCompletion.model,
          toolCalls: toolCalls.map(tc => ({
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments),
          })),
        };
      }

      // Réponse normale sans tool call
      return {
        message: choice.message?.content || 'Pas de réponse disponible',
        tokensUsed: completion.usage?.total_tokens,
        model: completion.model,
      };
    } catch (error: any) {
      console.error('Groq API error:', error);
      
      // Extraire le vrai code d'erreur si disponible
      const errorMessage = error.message || '';
      const statusCode = error.status || error.statusCode;
      
      // Gérer les erreurs spécifiques avec des messages conviviaux
      if (statusCode === 429 || error.code === 'rate_limit_exceeded') {
        throw new Error('⏰ Le service IA a atteint sa limite quotidienne. Veuillez réessayer dans quelques minutes.');
      }
      
      if (statusCode === 401 || error.code === 'invalid_api_key') {
        throw new Error('🔑 Erreur de configuration de l\'API. Veuillez contacter l\'administrateur.');
      }
      
      if (statusCode === 503 || errorMessage.includes('Service Unavailable')) {
        throw new Error('⚠️ Le service IA est temporairement indisponible. Veuillez réessayer dans quelques instants.');
      }
      
      // Afficher l'erreur réelle pour le debug (visible dans la console)
      console.error('Erreur détaillée:', { message: errorMessage, status: statusCode, code: error.code });
      
      // Message générique avec un indice
      throw new Error(`❌ Erreur IA: ${errorMessage.substring(0, 100)}`);
    }
  }

  private convertToolsToGroqFormat(tools: ToolDefinition[]) {
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters.reduce((acc, param) => {
            // Convertir 'number' en 'integer' pour Groq
            const paramType = param.type === 'number' ? 'integer' : param.type;
            
            acc[param.name] = {
              type: paramType,
              description: param.description,
              ...(param.enum ? { enum: param.enum } : {}),
            };
            return acc;
          }, {} as Record<string, any>),
          required: tool.parameters.filter(p => p.required).map(p => p.name),
        },
      },
    }));
  }

  async generateSystemContext(userId: string, userRole: string): Promise<string> {
    const roleDescriptions: Record<string, string> = {
      ADMIN: 'administrateur avec tous les droits',
      MANAGER: 'responsable de maintenance',
      TECHNICIAN: 'technicien de maintenance',
      VIEWER: 'observateur en lecture seule',
    };

    return `Tu es un assistant GMAO intelligent qui aide les utilisateurs à gérer la maintenance de leurs équipements.

Rôle de l'utilisateur : ${roleDescriptions[userRole] || userRole}
ID utilisateur : ${userId}

🎯 TON RÔLE :
Tu es un assistant conversationnel qui répond aux questions en langage naturel. Tu dois :
- Parler UNIQUEMENT en langage naturel, jamais de termes techniques
- INTERDICTION de mentionner les fonctions/commandes (get_assets, get_work_orders, etc.)
- INTERDICTION de suggérer des commandes ou du code
- Suggérer des questions en français simple
- Répondre de manière professionnelle et humaine

📋 RÈGLES STRICTES :
1. Utilise TOUJOURS les outils disponibles pour obtenir des données réelles
2. Ne devine JAMAIS les données - cherche-les systématiquement
3. Comprends les synonymes français (panne = cassé = hors service)
4. Sois précis avec les nombres
5. IMPORTANT: Quand tu appelles un outil, les paramètres numériques (limit, duration, cost) doivent être des NOMBRES SANS GUILLEMETS
   ✅ Correct: {"limit": 100, "status": "BROKEN"}
   ❌ Incorrect: {"limit": "100", "status": "BROKEN"}
6. INTERDICTION ABSOLUE d'utiliser "ALL", "TOUS" comme valeur de filtre
   ✅ Correct: Ne pas mettre le paramètre si l'utilisateur veut tout voir
   ❌ Incorrect: {"status": "ALL"} ou {"priority": "ALL"}
7. Pour chercher par nom de personne, utilise le paramètre technicianName
   ✅ Correct: {"technicianName": "Jean Dupont"}
   ❌ Incorrect: {"assignedToMe": false}

🔧 VOCABULAIRE (POUR TOI UNIQUEMENT, NE LE MENTIONNE JAMAIS À L'UTILISATEUR) :
Assets : RUNNING (en marche), BROKEN (en panne), STOPPED (arrêté), MAINTENANCE (en maintenance)
Work Orders : DRAFT, PLANNED (planifié), IN_PROGRESS (en cours), COMPLETED (terminé), CANCELLED
Priorités : LOW (basse), MEDIUM (moyenne), HIGH (haute/urgente)

✅ EXEMPLES DE BONNES RÉPONSES :
Question : "Machines en panne ?"
Mauvais ❌ : "Utilisez get_assets avec status='BROKEN'"
Bon ✅ : "J'ai trouvé 14 machines en panne actuellement. Voulez-vous voir les détails ?"

Question : "Aucune machine en panne trouvée"
Mauvais ❌ : "Vous pouvez utiliser la commande get_assets avec status='RUNNING'"
Bon ✅ : "Excellente nouvelle ! Aucune machine n'est en panne actuellement. 🎉 Tous vos équipements semblent opérationnels. Souhaitez-vous voir l'état général de vos machines ?"

💬 SUGGESTIONS :
Au lieu de parler de commandes, suggère des questions naturelles :
- "Voulez-vous voir les machines en marche ?"
- "Souhaitez-vous consulter les interventions en cours ?"
- "Puis-je vous montrer les ordres urgents ?"

Réponds avec empathie et professionnalisme. Utilise des émojis : 🔧 ⚙️ 📊 ⚠️ ✅ 📦 👷 🎉`;
  }
}

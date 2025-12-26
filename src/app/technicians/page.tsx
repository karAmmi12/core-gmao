import { TechnicianService } from "@/core/application/services/TechnicianService";
import { MainLayout } from "@/presentation/components/layouts/MainLayout";
import { User, Mail, Phone, Wrench } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TechniciansPage() {
  const service = new TechnicianService();
  const technicians = await service.getAllTechnicians();

  return (
    <MainLayout>
      <div className="container-page">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">👷 Équipe Technique</h1>
          <p className="text-neutral-600 mt-2">
            Gestion des techniciens et de leurs compétences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((tech) => (
            <div
              key={tech.id}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="text-primary-600" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-neutral-900">{tech.fullName}</h3>
                    {tech.isActive && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-700">
                        Actif
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Mail size={14} />
                      <span>{tech.email}</span>
                    </div>
                    
                    {tech.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone size={14} />
                        <span>{tech.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench size={14} className="text-neutral-500" />
                      <span className="text-xs font-semibold text-neutral-700 uppercase">Compétences</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tech.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-primary-700 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {technicians.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto text-neutral-300" size={64} />
            <p className="text-neutral-500 mt-4">Aucun technicien disponible</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

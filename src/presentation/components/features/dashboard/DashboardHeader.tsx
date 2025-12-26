export const DashboardHeader = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black text-neutral-900 mb-2">
        Supervision du Parc Machine
      </h1>
      <p className="text-neutral-600">
        Vue d'ensemble en temps réel — {new Date().toLocaleDateString('fr-FR')}
      </p>
    </div>
  );
};

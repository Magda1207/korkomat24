import { Card } from 'primereact/card';

function PanelCard({ title, value, icon, color}) {

  return (
    <Card className="flex-1">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-500 text-sm mb-1">{title}</div>
          <div className="text-2xl font-semibold text-gray-800">{value}</div>
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default PanelCard;

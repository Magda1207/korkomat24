import icons from '../partials/icons';

function SubjectLevelItem({ subjectId, levelObj, onDelete, readOnly }) {
  return (
    <li className="bg-blue-50 rounded-md px-4 py-2 mb-2 inline-block mr-3 min-w-[160px]">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-blue-900">{levelObj.level}</span>
        {!readOnly && (
          <button
            className="text-blue-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm ml-2"
            onClick={() => onDelete(subjectId, levelObj.level)}
            title="Usuń"
          >
            {icons.X}
          </button>
        )}
      </div>
      <div className="flex items-center mt-2 text-blue-900 text-sm">
        <span className="inline-flex items-center mr-4">
          {icons.Dollar}
          <span className="ml-1 font-semibold">{levelObj.price}zł</span>
        </span>
        <span className="inline-flex items-center">
          {icons.Clock}
          <span className="ml-1">45min</span>
        </span>
      </div>
    </li>
  );
}

export default SubjectLevelItem;

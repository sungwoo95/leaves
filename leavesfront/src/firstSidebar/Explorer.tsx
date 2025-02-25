import { Directory } from "../types";

const Explorer = ({ directories }: { directories: Directory[] }) => {
  return (
    <ul>
      {directories.map((item, index) => (
        <li key={index}>
          {item.type === "folder" ? (
            <>
              📁 {item.name}
              {item.children && <Explorer directories={item.children} />} {/* 재귀 호출 */}
            </>
          ) : (
            <>📄 {item.name}</>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Explorer;

const DynamicTable = ({ data, columns }) => {
    return (
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.cellRenderer ? 
                    column.cellRenderer(item) : 
                    item[column.field]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
export default DynamicTable;

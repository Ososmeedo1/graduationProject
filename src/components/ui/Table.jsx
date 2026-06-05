import React from 'react';
import PropTypes from 'prop-types';

/**
 * Responsive table component wrapper
 * Supports both Composition (children) and Data-Driven (columns/data) modes.
 */
const Table = ({
  children,
  className = '',
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  ...props
}) => {
  // Data-Driven Mode
  if (columns && Array.isArray(columns)) {
    return (
      <div className={`overflow-x-auto rounded-lg border border-stroke ${className}`} {...props}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 bg-surface text-sm">
          <Header>
            <Row>
              {columns.map((col, idx) => (
                <Head
                  key={col.accessor || idx}
                  align={col.align || 'left'}
                  className={col.className}
                >
                  {col.header}
                </Head>
              ))}
            </Row>
          </Header>
          <Body>
            {isLoading ? (
              <Row>
                <Cell colSpan={columns.length} className="text-center py-8 text-ink-muted">
                  Loading...
                </Cell>
              </Row>
            ) : data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <Row
                  key={row.id || rowIndex}
                  className={onRowClick ? 'cursor-pointer hover:bg-surface-muted' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIndex) => (
                    <Cell
                      key={`${rowIndex}-${colIndex}`}
                      align={col.align || 'left'}
                      className={col.className}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                    </Cell>
                  ))}
                </Row>
              ))
            ) : (
              <Row>
                <Cell colSpan={columns.length} className="text-center py-8 text-ink-muted">
                  {emptyMessage}
                </Cell>
              </Row>
            )}
          </Body>
        </table>
      </div>
    );
  }

  // Composition Mode (Legacy/Custom)
  return (
    <div className={`overflow-x-auto rounded-lg border border-stroke ${className}`} {...props}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 bg-surface text-sm">
        {children}
      </table>
    </div>
  );
};

const Header = ({ children }) => (
  <thead className="bg-surface-muted">
    {children}
  </thead>
);

const Body = ({ children }) => (
  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-surface">
    {children}
  </tbody>
);

const Row = ({ children, className = '' }) => (
  <tr className={`hover:bg-surface-muted transition-colors ${className}`}>
    {children}
  </tr>
);

const Head = ({ children, className = '', align = 'left' }) => {
  const alignClass = {
    left: 'text-left rtl:text-right',
    center: 'text-center',
    right: 'text-right rtl:text-left',
  }[align];

  return (
    <th className={`px-4 py-3 font-medium text-ink-muted uppercase tracking-wider ${alignClass} ${className}`}>
      {children}
    </th>
  );
};

const Cell = ({ children, className = '', align = 'left' }) => {
  const alignClass = {
    left: 'text-left rtl:text-right',
    center: 'text-center',
    right: 'text-right rtl:text-left',
  }[align];

  return (
    <td className={`px-4 py-3 text-ink whitespace-nowrap ${alignClass} ${className}`}>
      {children}
    </td>
  );
};

Table.Header = Header;
Table.Body = Body;
Table.Row = Row;
Table.Head = Head;
Table.Cell = Cell;

Table.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Table;

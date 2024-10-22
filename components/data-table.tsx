const renderCol = (col: unknown): string => {
    if (Number.isFinite(col)) {
        return Number(col).toString();
    }

    const date = new Date(col);
    if (date instanceof Date && !Number.isNaN(date.valueOf())) {
        return date.toLocaleString();
    }

    return col?.toString() ?? '?';
}

export const DataTable = (props: { data: Record<string, unknown>[] }) => {
	const head = Object.keys(props.data[0]);
	const cols = props.data.map((row) => head.map((th) => row[th]));

	return (
		<table>
			<thead>
				<tr>
					{head.map((col) => (
						<th>{col}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{cols.map((row) => (
					<tr>
						{row.map((col) => (
							<td>{renderCol(col)}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};

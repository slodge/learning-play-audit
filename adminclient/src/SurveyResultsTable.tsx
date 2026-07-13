import React, { useState, useEffect, MouseEvent } from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import GetAppIcon from "@material-ui/icons/GetApp";
import ListAltIcon from "@material-ui/icons/ListAlt";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";

import TablePagination from "@material-ui/core/TablePagination";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import { getSummaryResponses, SurveySummary } from "./model/SurveyModel";
import { useSelector } from "react-redux";
import { TableFooter } from "@material-ui/core";

const MAX_AGGREGATE_SURVEYS = 6;

const ORDER_ASCENDING = "asc";
const ORDER_DESCENDING = "desc";

type ORDER_DIRECTION = typeof ORDER_ASCENDING | typeof ORDER_DESCENDING;

const FIELD_ID = "id";
const FIELD_TIMESTAMP = "timestampString";
const FIELD_SCHOOL = "schoolName";
const FIELD_CONTACT_NAME = "responderName";
const FIELD_EMAIL = "responderEmail";
const FIELD_STATE = "uploadState";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  title: {
    marginRight: "25px",
  },
});

const useToolbarStyles = makeStyles(() => ({
  root: {
    justifyContent: "space-between",
  },
}));

const useHeaderStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

interface TableToolbarProps {
  numSelected: number;
  viewSurveys: () => void;
  exportCsv: () => void;
}

function TableToolbar({
  numSelected,
  viewSurveys,
  exportCsv,
}: TableToolbarProps) {
  const classes = useToolbarStyles();

  function viewButtonText() {
    if (numSelected <= 1) {
      return "View Survey";
    }
    if (numSelected <= MAX_AGGREGATE_SURVEYS) {
      return "View Surveys";
    }
    return "View Surveys (up to " + MAX_AGGREGATE_SURVEYS + " responses)";
  }

  return (
    <Toolbar classes={{ root: classes.root }}>
      {numSelected > 0 ? (
        <Typography color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography variant="h6" component="div">
          Survey Responses
        </Typography>
      )}

      {numSelected > 0 ? (
        <div className="multiple-survey-actions">
          <Button
            onClick={viewSurveys}
            color="primary"
            startIcon={<ListAltIcon />}
            disabled={numSelected > MAX_AGGREGATE_SURVEYS}
          >
            {viewButtonText()}
          </Button>
          <Button
            onClick={exportCsv}
            color="primary"
            startIcon={<GetAppIcon />}
          >
            Export surveys as CSV
          </Button>
        </div>
      ) : (
        <></>
      )}
    </Toolbar>
  );
}

function descendingComparator(
  a: Record<string, any>,
  b: Record<string, any>,
  orderBy: string
) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];
  if (bValue === undefined || bValue === null) {
    return -1;
  }
  if (aValue === undefined || aValue === null) {
    return 1;
  }
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

type Comparator = (a: Record<string, any>, b: Record<string, any>) => number;

function getComparator(
  orderDirection: ORDER_DIRECTION,
  orderBy: string
): Comparator {
  return orderDirection === ORDER_DESCENDING
    ? (a: Record<string, any>, b: Record<string, any>) =>
        descendingComparator(a, b, orderBy)
    : (a: Record<string, any>, b: Record<string, any>) =>
        descendingComparator(b, a, orderBy);
}

function stableSort(array: SurveySummary[], comparator: Comparator) {
  const stabilizedThis: { element: SurveySummary; index: number }[] = array.map(
    (element, index) => ({ element, index })
  );
  stabilizedThis.sort((a, b) => {
    const order = comparator(a.element, b.element);
    return order !== 0 ? order : a.index - b.index;
  });
  return stabilizedThis.map((entry) => entry.element);
}

interface LTLTableHeadProps {
  onSelectAllClick: (checked: boolean) => void;
  orderDirection: ORDER_DIRECTION;
  orderBy: string;
  numSelected: number;
  rowCount: number;
  onRequestSort: (property: string) => void;
}

function LTLTableHead({
  onSelectAllClick,
  orderDirection,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
}: LTLTableHeadProps) {
  const classes = useHeaderStyles();

  const headCells = [
    { id: FIELD_TIMESTAMP, disablePadding: true, label: "Submission Date" },
    { id: FIELD_SCHOOL, disablePadding: false, label: "School" },
    { id: FIELD_CONTACT_NAME, disablePadding: false, label: "Contact Name" },
    { id: FIELD_EMAIL, disablePadding: false, label: "Email" },
    { id: FIELD_ID, disablePadding: false, label: "Id" },
    { id: FIELD_STATE, disablePadding: false, label: "Upload State" },
  ];

  const orderDirectionText =
    orderDirection === ORDER_DESCENDING
      ? "sorted descending"
      : "sorted ascending";

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={(_, checked) => onSelectAllClick(checked)}
            inputProps={{ "aria-label": "select all" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? orderDirection : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={
                orderBy === headCell.id ? orderDirection : ORDER_ASCENDING
              }
              onClick={() => onRequestSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {orderDirectionText}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export interface SurveyResultsTableProps {
  openSurveyResponses: (surveyIds: string[]) => void;
  exportCsv: (surveyIds: string[]) => void;
}

function SurveyResultsTable({
  openSurveyResponses,
  exportCsv,
}: SurveyResultsTableProps) {
  const classes = useStyles();

  const summaryResponses = useSelector(getSummaryResponses);

  const [selectedSurveyIds, setSelectedSurveyIds] = useState<string[]>([]);

  const [orderDirection, setOrderDirection] =
    React.useState<ORDER_DIRECTION>(ORDER_DESCENDING);
  const [orderBy, setOrderBy] = React.useState(FIELD_TIMESTAMP);
  const [orderedDataRows, setOrderedDataRows] = React.useState<SurveySummary[]>(
    []
  );

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  useEffect(() => {
    setSelectedSurveyIds([]);
  }, [summaryResponses]);

  useEffect(() => {
    setOrderedDataRows(
      stableSort(summaryResponses, getComparator(orderDirection, orderBy))
    );
  }, [summaryResponses, orderDirection, orderBy]);

  function handleRequestSort(property: string) {
    const isAsc = orderBy === property && orderDirection === ORDER_ASCENDING;
    setOrderDirection(isAsc ? ORDER_DESCENDING : ORDER_ASCENDING);
    setOrderBy(property);
  }

  function handleChangeRowsPerPage(rowCountText: string) {
    setRowsPerPage(parseInt(rowCountText, 10));
    setPage(0);
  }

  function handleSelectAllClick(checked: boolean) {
    setSelectedSurveyIds(checked ? summaryResponses.map((n) => n.id) : []);
  }

  function handleCheckClick(event: MouseEvent, id: string) {
    event.stopPropagation();
    setSelectedSurveyIds((oldSelectedSurveyIds) => {
      const selectedIndex = oldSelectedSurveyIds.indexOf(id);
      if (selectedIndex === -1) {
        return [...oldSelectedSurveyIds, id];
      } else {
        return oldSelectedSurveyIds.filter((item) => item !== id);
      }
    });
  }

  const numSelected = selectedSurveyIds.length;
  const rowCount = summaryResponses.length;

  return (
    <Paper>
      <TableToolbar
        numSelected={numSelected}
        viewSurveys={() => openSurveyResponses(selectedSurveyIds)}
        exportCsv={() => exportCsv(selectedSurveyIds)}
      />
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <LTLTableHead
            numSelected={numSelected}
            orderDirection={orderDirection}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rowCount}
          />

          <TableBody>
            {orderedDataRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                const isItemChecked = selectedSurveyIds.includes(row.id);

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemChecked}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemChecked}
                    onClick={(event) => handleCheckClick(event, row.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemChecked} />
                    </TableCell>
                    <TableCell component="th" scope="row" padding="none">
                      {row.timestampString}
                    </TableCell>
                    <TableCell align="left">{row.schoolName}</TableCell>
                    <TableCell align="left">{row.responderName}</TableCell>
                    <TableCell align="left">{row.responderEmail}</TableCell>
                    <TableCell align="left">{row.id}</TableCell>
                    <TableCell align="left">{row.uploadState}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                count={summaryResponses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) =>
                  handleChangeRowsPerPage(
                    (event.target as HTMLInputElement).value
                  )
                }
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default SurveyResultsTable;

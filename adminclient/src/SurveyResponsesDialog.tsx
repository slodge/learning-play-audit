import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import SurveyResponses from "./SurveyResponses";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { exportSurveysAsDocx } from "./SurveysAsDoc";
import GetAppIcon from "@material-ui/icons/GetApp";
import CloseIcon from "@material-ui/icons/Close";
import {
  allSurveysRetrieved,
  getFullSurveyResponses,
  SurveyResponse,
} from "./model/SurveyModel";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  title: {
    flexGrow: 1,
  },
  paper: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  scrollPaper: {
    alignItems: "start",
  },
}));

export interface SurveyResponsesDialogProps {
  surveyIds: string[];
  handleClose: () => void;
}

function SurveyResponsesDialog({
  surveyIds,
  handleClose,
}: SurveyResponsesDialogProps) {
  const classes = useStyles();

  const fullSurveyResponses = useSelector(getFullSurveyResponses);

  const [selectedResponses, setSelectedResponses] = useState<SurveyResponse[]>(
    []
  );
  const [exportDocxRequested, setExportDocxRequested] = useState(false);

  useEffect(() => {
    if (allSurveysRetrieved(surveyIds, fullSurveyResponses)) {
      setSelectedResponses(surveyIds.map((id) => fullSurveyResponses[id]));
    }
  }, [surveyIds, fullSurveyResponses]);

  const handleExportAsDocx = () => {
    if (
      allSurveysRetrieved(surveyIds, fullSurveyResponses) &&
      surveyIds.length === selectedResponses.length
    ) {
      setExportDocxRequested(true);
    }
  };

  function canExportAsDocx() {
    return (
      allSurveysRetrieved(surveyIds, fullSurveyResponses) &&
      surveyIds.length === selectedResponses.length
    );
  }

  useEffect(() => {
    if (exportDocxRequested) {
      setExportDocxRequested(false);
      exportSurveysAsDocx(selectedResponses);
    }
  }, [
    selectedResponses,
    exportDocxRequested,
    surveyIds,
    fullSurveyResponses,
  ]);

  return (
    <Dialog
      className="multiple-surveys-response"
      classes={{
        scrollPaper: classes.scrollPaper,
      }}
      open={true}
      onClose={handleClose}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      maxWidth="lg"
      fullWidth={true}
    >
      <DialogContent dividers={true}>
        <DialogTitle id="scroll-dialog-title">Survey Responses</DialogTitle>
        <SurveyResponses
          id="scroll-dialog-description"
          surveys={selectedResponses}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleExportAsDocx}
          color="primary"
          startIcon={<GetAppIcon />}
          disabled={!canExportAsDocx()}
        >
          Export {selectedResponses.length > 1 ? "surveys" : "survey"} as Word
          Document
        </Button>
        <Button onClick={handleClose} color="primary" startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SurveyResponsesDialog;

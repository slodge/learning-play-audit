import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import CloseIcon from "@material-ui/icons/Close";
import {
  getTOTPSetupQrCode,
  verifyTOTPSetup,
  setAuthError,
  getAuthError,
  getSurveyUser,
} from "learning-play-audit-shared";

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

export const ERROR_TOTP_NOT_SETUP = "User has not set up software token mfa";
export const ERROR_TOTP_NOT_VERIFIED =
  "User has not verified software token mfa";
export const ERROR_TOTP_CODE_MISMATCH =
  "Code mismatch and fail enable Software Token MFA";

const CODE_ID = "codeInput";

export interface MfaSetupDialogProps {
  handleClose: () => void;
}

export default function MfaSetupDialog({ handleClose }:MfaSetupDialogProps) {
  const classes = useStyles();

  const dispatch = useDispatch();
  const user = useSelector(getSurveyUser)!;
  const errorMessage = useSelector(getAuthError);

  const [setupTOTP, setSetupTOTP] = useState(false);
  const [code, setCode] = useState("");
  const [qrCodeImageSource, setQrCodeImageSource] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [errorMessage]);

  function handleConfirm() {
    console.debug("Called handleConfirm");
    setLoading(true);
    dispatch(verifyTOTPSetup(user, code))
      .then(() => {
        setSetupTOTP(false);
        setLoading(false);
      })
      .catch((error: Error) => {
        console.warn(error);
        setLoading(false);
      });
  }

  return (
    <Dialog
      className="mfa-setup-dialog"
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
      <DialogTitle id="dialog-title">Set Login Security</DialogTitle>
      <DialogContent dividers={true}>
        <div className="content">
          <p>Click the button below to reset your TOTP software token.</p>
          {!setupTOTP && (
            <button
              id="reset-totp-button"
              onClick={() => {
                getTOTPSetupQrCode(user)
                  .then((qrCode) => {
                    setQrCodeImageSource(qrCode);
                    setSetupTOTP(true);
                  })
                  .catch((error) => {
                    console.error(error);
                    dispatch(setAuthError(error));
                  });
              }}
            >
              RESET SECURITY TOKEN
            </button>
          )}
          {setupTOTP && (
            <>
              <h3>Scan then enter verification code:</h3>

              <img id="qr-code" src={qrCodeImageSource} alt="qrcode" />
              <div className="action-row">
                <input
                  id={CODE_ID}
                  type="number"
                  onInput={(event) =>
                    setCode((event.target as HTMLInputElement).value)
                  }
                  placeholder="Enter your code"
                  min="0"
                />
                <button
                  id="confirm-button"
                  onClick={handleConfirm}
                  disabled={loading || code.length < 6}
                >
                  {loading ? (
                    <div className="loader" />
                  ) : (
                    <span>VERIFY SECURITY TOKEN</span>
                  )}
                </button>
                {errorMessage === ERROR_TOTP_CODE_MISMATCH && (
                  <div className="error-message">
                    Invalid code.
                    <br /> Please try again.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" startIcon={<CloseIcon />}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

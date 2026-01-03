import React, { useEffect, useState } from "react";
import {
  AuthCurrentUser,
  Authenticator,
  getAuthState,
  isAuthenticating,
} from "learning-play-audit-shared";
import { current_survey_version } from "learning-play-audit-survey";
import IntroductionSection from "./components/IntroductionSection";
import ResultsSection from "./components/ResultsSection";
import GallerySection from "./components/GallerySection";
import SubmitSection from "./components/SubmitSection";
import NavDrawer from "./components/NavDrawer";
import Section from "./components/Section";
import AuthSignOutWithConfirm from "./components/auth/AuthSignOutWithConfirm";
import RestartButton from "./components/RestartButton";
import GetStartedScreen from "./components/GetStartedScreen";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentSectionId,
  getHasSeenSplashPage,
  refreshState,
} from "./model/SurveyModel";
import { Amplify } from "@aws-amplify/core";
import { menuButtonSvg } from "./components/SvgUtils";
import { GALLERY, INTRODUCTION, RESULTS, SUBMIT } from "./model/SurveySections";
import "./App.css";

// Configure these properties in .env.local
const AWS_CLIENT_API_ENDPOINT = process.env.REACT_APP_AWS_CLIENT_API_ENDPOINT!;
const ENVIRONMENT_NAME = process.env.REACT_APP_DEPLOY_ENVIRONMENT!;

const isLive = ENVIRONMENT_NAME === "LIVE";

const awsConfig = {
  Auth: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID,
  },
};

//window.LOG_LEVEL = "DEBUG";
// eslint-disable-next-line jest/require-hook
console.debug("Configure", Amplify.configure(awsConfig));

function App() {
  const dispatch = useDispatch();
  const authState = useSelector(getAuthState);
  const hasSeenSplashPage = useSelector(getHasSeenSplashPage);
  const currentSectionId = useSelector(getCurrentSectionId);

  const [popupNavDrawerOpen, setPopupNavDrawerOpen] = useState(false);

  // Restore locally stored answers if existing
  useEffect(() => {
    dispatch(refreshState());
  }, [dispatch]);


  const [deferredInstallEvent, setDeferredInstallEvent] =
    useState<Event | null>(null);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    const listener: EventListener = (event: Event) => {
      console.debug("beforeinstallprompt triggered");
      event.preventDefault();
      setDeferredInstallEvent(event);
    };
    window.addEventListener("beforeinstallprompt", listener);

    return function cleanup() {
      window.removeEventListener("beforeinstallprompt", listener);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      console.log("PWA install successful");
      setAppInstalled(true);
    };
    window.addEventListener("appinstalled", listener);

    return function cleanup() {
      window.removeEventListener("appinstalled", listener);
    };
  }, []);

  useEffect(() => {
    const listener = () => {
      let displayMode = "browser tab";
      // Available on iOS safari only
      if ((navigator as any).standalone) {
        displayMode = "standalone-ios";
        setAppInstalled(true);
      }
      if (window.matchMedia("(display-mode: standalone)").matches) {
        displayMode = "standalone";
        setAppInstalled(true);
      }
      console.debug("Running mode: ", displayMode);
    };
    window.addEventListener("DOMContentLoaded", listener);

    return function cleanup() {
      window.removeEventListener("DOMContentLoaded", listener);
    };
  }, []);

  useEffect(() => {
    const innerListener = (evt: MediaQueryListEvent) => {
      let displayMode = "browser tab";
      if (evt.matches) {
        displayMode = "standalone";
        setAppInstalled(true);
      }
      console.debug("Running mode: ", displayMode);
    };
    const outerListener = () => {
      window
        .matchMedia("(display-mode: standalone)")
        .addEventListener("change", innerListener);
    };
    window.addEventListener("DOMContentLoaded", outerListener);

    return function cleanup() {
      window.removeEventListener("DOMContentLoaded", outerListener);
    };
  }, []);

  useEffect(() => {
    setPopupNavDrawerOpen(false);
    window.scrollTo({ top: 0 });
  }, [currentSectionId]);

  function handleInstall() {
    if (deferredInstallEvent) {
      // BeforeInstallPromptEvent type is not supported on all browsers
      (deferredInstallEvent as any).prompt();
    }
  }

  function canInstall() {
    return deferredInstallEvent !== null && !appInstalled;
  }

  function downloadButtonMain() {
    if (!canInstall()) {
      return null;
    }

    return (
      <button
        aria-haspopup="true"
        aria-label="Install Application"
        onClick={handleInstall}
        className="download-button"
      >
        INSTALL SURVEY APP
      </button>
    );
  }

  function downloadButtonAppBar() {
    if (!canInstall()) {
      return null;
    }

    return (
      <button
        aria-haspopup="true"
        aria-label="Install Application"
        onClick={handleInstall}
        className="download-button"
      >
        <span className="large">INSTALL APP</span>
        <span className="small">INSTALL</span>
      </button>
    );
  }

  function getCurrentSection() {
    if (currentSectionId === INTRODUCTION) {
      return <IntroductionSection />;
    }
    if (currentSectionId === RESULTS) {
      return <ResultsSection />;
    }
    if (currentSectionId === GALLERY) {
      return <GallerySection />;
    }
    if (currentSectionId === SUBMIT) {
      return <SubmitSection endpoint={AWS_CLIENT_API_ENDPOINT} />;
    }

    const section = current_survey_version().sections.find(
      (item) => currentSectionId === item.id
    )!;

    if (section) {
      return <Section key={section.id} section={section} />;
    }

    // can't set currentSectionId, but show the intro anyway...
    // currentSectionId = INTRODUCTION;
    return <IntroductionSection />;    
  }

  function titleText() {
    if (!hasSeenSplashPage || isAuthenticating(authState)) {
      return (
        <>
          <h1 className="title large">
            Welcome to the Learning through Landscapes
            <br />
            Learning and Play Audit Survey
          </h1>
          <h1 className="title small">
            Welcome to the
            <br />
            <span className="ltl-title">Learning through Landscapes</span>
            <br />
            Learning and Play Audit Survey
          </h1>
        </>
      );
    }

    return (
      <h1 className="title">
        Learning through Landscapes
        <br />
        Learning and Play Audit Survey
      </h1>
    );
  }

  function titleLogo() {
    return (
      <img className="title-logo" src="./assets/LTL_logo_large.png" alt="" />
    );
  }

  if (isAuthenticating(authState)) {
    return (
      <div className="root">
        <div className="background-overlay" />
        <div className="app-bar authenticating">
          {titleLogo()}
          {titleText()}
        </div>
        <main className="content authenticating">
          <Authenticator />
        </main>
      </div>
    );
  }

  if (!hasSeenSplashPage) {
    return (
      <div className="root">
        <div className="background-overlay" />
        <div className="app-bar authenticating">
          {titleLogo()}
          {titleText()}
          <AuthSignOutWithConfirm />
          <AuthCurrentUser />
        </div>
        <main className="content authenticating">
          <GetStartedScreen downloadButton={downloadButtonMain()} />
        </main>
      </div>
    );
  }

  return (
    <div className="root">
      <div className="app-bar main">
        <button
          aria-label="open drawer"
          onClick={() => setPopupNavDrawerOpen(true)}
          className="menu-button"
        >
          {menuButtonSvg()}
        </button>

        {titleLogo()}
        {titleText()}
        <AuthSignOutWithConfirm />
        <RestartButton />
        {downloadButtonAppBar()}
        {!isLive && <div className="environment-name">{ENVIRONMENT_NAME}</div>}
        <AuthCurrentUser />
      </div>
      <main className="content main">
        <NavDrawer
          popupDrawerOpen={popupNavDrawerOpen}
          onPopupClose={() => setPopupNavDrawerOpen(false)}
        />
        {getCurrentSection()}
      </main>
    </div>
  );
}

export default App;

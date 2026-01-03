import React, { useState } from "react";
import "../App.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getPhotoDetails,
  loadPhotos,
  PhotoDetails,
} from "../model/SurveyModel";
import GalleryPhoto from "./GalleryPhoto";
import SectionBottomNavigation from "./SectionBottomNavigation";
import { addPhotoSvg } from "./SvgUtils";
import { sectionQuestions, current_survey_version } from "learning-play-audit-survey";
import Modal from "@material-ui/core/Modal";

function GallerySection() {
  const dispatch = useDispatch();
  const photoDetails = useSelector(getPhotoDetails);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const addPhoto = (files: FileList) => {
    dispatch(loadPhotos(Array.from(files)));
    setShowConfirmDialog(true);
  };

  function isGeneralPhoto(currentPhotoDetails: PhotoDetails) {
    return !currentPhotoDetails.sectionId || !currentPhotoDetails.questionId;
  }

  function getSectionQuestionPhotoIdMap() {
    const result: Record<string, Record<string, string[]>> = {};

    Object.keys(photoDetails)
      .filter((photoId) => !isGeneralPhoto(photoDetails[photoId]))
      .forEach((photoId) => {
        const current = photoDetails[photoId];

        let section = result[current.sectionId!];
        if (section === undefined) {
          section = {};
          result[current.sectionId!] = section;
        }
        let question = section[current.questionId!];
        if (question === undefined) {
          question = [];
          section[current.questionId!] = question;
        }
        question.push(photoId);
      });

    return result;
  }

  function orderedPhotos() {
    const output = [];

    const generalPhotoIds = Object.keys(photoDetails).filter((photoId) =>
      isGeneralPhoto(photoDetails[photoId])
    );
    if (generalPhotoIds.length > 0) {
      output.push(
        <div key="general" id="general" className="gallery-section-question">
          <h3>General</h3>
          {generalPhotoIds.map((photoId) => (
            <GalleryPhoto key={photoId} photoId={photoId} />
          ))}
        </div>
      );
    }

    const questionPhotoIds = getSectionQuestionPhotoIdMap();

    current_survey_version().sections.forEach((section) => {
      const sectionId = section.id;
      const sectionTitle = section.title;

      const photoSection = questionPhotoIds[sectionId];
      if (photoSection === undefined) {
        return;
      }

      sectionQuestions(section).forEach(({ id, text }) => {
        const photoQuestion = photoSection[id];
        if (photoQuestion === undefined) {
          return;
        }

        output.push(
          <div
            key={sectionId + "-" + id}
            id={sectionId + "-" + id}
            className="gallery-section-question"
          >
            <h3>{`${sectionTitle} - ${text}`}</h3>
            {photoQuestion.map((photoId) => (
              <GalleryPhoto key={photoId} photoId={photoId} />
            ))}
          </div>
        );
      });
    });

    return output;
  }

  return (
    <div className="section gallery">
      <div className="section-header">
        <h1 className="title">Photos</h1>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="icon-button-add-photo"
          type="file"
          multiple={true}
          onChange={(event) =>
            event.target.files && addPhoto(event.target.files)
          }
        />
        <label htmlFor="icon-button-add-photo">
          <span className="label-text">
            Select
            <br />
            photo
          </span>
          {addPhotoSvg()}
        </label>
      </div>
      {orderedPhotos()}
      <SectionBottomNavigation />
      {showConfirmDialog && (
        <Modal
          id="confirm-dialog-container"
          container={
            window !== undefined ? () => window.document.body : undefined
          }
          keepMounted={false}
          open={true}
          onClose={() => setShowConfirmDialog(false)}
        >
          <div className="dialog confirm-add-photos">
            <p>Photo(s) added</p>
            <div className="action-row">
              <button
                id="ok-button"
                onClick={() => setShowConfirmDialog(false)}
                aria-label="OK"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default GallerySection;

import React, { useState } from "react";
import "../App.css";
import { addPhotoSvg } from "./SvgUtils";
import SectionBottomNavigation from "./SectionBottomNavigation";

function ExampleQuestion() {
  const [answer, setAnswer] = useState<string|null>(null);

  function toggleButton(value:string, label:string) {
    return (
      <button
        id={value}
        className={answer === value ? "selected" : ""}
        onClick={() => setAnswer(answer === value ? null : value)}
        aria-label={label}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="question">
      <div className="action-row">
        <div className="toggle-button-group">
          {toggleButton("a", "strongly agree")}
          {toggleButton("b", "tend to agree")}
          {toggleButton("c", "tend to disagree")}
          {toggleButton("d", "strongly disagree")}
        </div>
      </div>
    </div>
  );
}

function IntroductionSection() {
  return (
    <>
      <div className="section introduction">
        <h1 className="title">Introduction</h1>
        <p>
          This audit is intended to assist in understanding the risks that our changing climate brings to your school
          grounds, and the nature-based adaptations you can make. It is not intended to be exhaustive or dictate your
          priorities. The intention is to provide an opportunity to reflect on your education practice and how well
          adapted your spaces are to our changing climate.This audit is intended to assist in understanding the risks
          that our changing climate brings to your school grounds, and the nature-based adaptations you can make. It
          is not intended to be exhaustive or dictate your priorities. The intention is to provide an opportunity to
          reflect on your education practice and how well adapted your spaces are to our changing climate.
        </p>
        <p>
          How to use the audit: this audit is best undertaken with a group of learners and adults from the school - 
          different views and experiences are important. Do also undertake the audit with a map in hand and while
          moving around the school grounds. Pupils often know 'secret' areas, and it can also jog memories around
          what happens on a windy, wet, or hot day in the grounds.
        </p>
        <p>
          To complete the audit, select the closest matching statement. You can enter your results directly in the
          digital version of the audit or complete the audit on paper before entering the results back in the classroom.
          Please note that an incomplete audit will create incomplete results, as the questions interlink with each other.
        </p>
        <p>
          On the 'Results' tab you will find a graph of where you are currently with regards to having climate ready
          school grounds.
        </p>
        <p>
          After completing this audit and gathering the results, do engage with the pupils and other staff about what
          you have learned, and agree what your priorities and plans are. This audit is as much about your practice as
          an educator and the learning experience your pupils have as it is about adapting our schools' outdoor spaces
          to better prepare for a changing climate.
        </p>
        <p>
          <b>
            <a href='https://www.ltl.org.uk' target="_blank">www.ltl.org.uk</a> | 
            <a href='tel:+441786465934'>01786 465 934</a>
          </b>
        </p>
        <p>
          This audit is for non-commercial use only, Copywright Learning through Landscapes 2024
        </p>
      </div>
      <div className="section introduction">
        <h1 className="title">How To Complete The Survey</h1>
        <p>
          Most of the 'questions' you will answer are actually statements -
          which you have to respond to on the following scale:
        </p>
        <ExampleQuestion />
        <div className="icons-group">
          <div className="icon-description">
            <img
              className="add-note-icon"
              src={"./assets/add_note.svg"}
              alt="add note"
            />
            Use the note icon to add any notes or comments that you want to
            make.
          </div>
          {
            /*
              <div className="icon-description">
                  {addPhotoSvg()}
                  Use the camera icon to attach any photos you would like to add.
              </div>
            */
          }
        </div>
        <p>
          It is helpful if you answer as many questions as you are able to,
          however it is not compulsory to complete all questions.
        </p>
      </div>
      <div className="section introduction">
        <h1 className="title">Unitied Nations Sustainable Development Goals</h1>
        <p>
            This School Ground Climate Audit framework aligns with several United Nations Sustainable Development Goals (UNSDGs),
            demonstrating how school grounds and outdoor learning practices contribute to global sustainability targets. 
            The framework particularly supports:
        </p>
        <ul>
          <li>
            <b>Goal 3:</b> <i>Good Health and Well-being</i> through promoting outdoor play and physical activity
          </li>
          <li>
            <b>Goal 4:</b> <i>Quality Education</i> via curriculum integration and outdoor learning opportunities
          </li>
          <li>
            <b>Goal 11:</b> <i>Sustainable Cities and Communities</i> by creating inclusive, safe, and resilient school environments
          </li>
          <li>
            <b>Goal 13:</b> <i>Climate Action</i> through carbon sequestration, climate adaptation features, and climate change education
          </li>
          <li>
            <b>Goal 15:</b> <i>Life on Land</i> by creating and maintaining features for nature, biodiversity, and ecosystem health
          </li>
          <li>
            <b>Goal 17:</b> <i>Partnerships for the Goals</i> by encouraging collaboration with communities and specialist partners
          </li>
        </ul>
        <p>
          These interconnected goals underscore the holistic approach needed to transform school grounds into educational and sustainable spaces.
        </p>
        <SectionBottomNavigation />
      </div>
    </>
  );
}

export default IntroductionSection;

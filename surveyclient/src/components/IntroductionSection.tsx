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
          This audit tool was developed by Learning through Landscapes (LtL) to help you reflect on your
          outdoor spaces. This is not intended to be exhaustive or dictate your priorities, but rather to
          provide an opportunity to reflect on your education practice, outdoor learning and play, with a
          focus on how well adapted your spaces are to cope with the risks our changing climate brings
          and the nature-based adaptations you can make.
        </p>
        <h2>
          How to use the audit
        </h2>
        <p>
          You should be able to complete the audit in around an hour using your existing knowledge of
          the site and can be done offline.
        </p>
        <p>
          This audit is best undertaken with a group of learners and adults from the school - different
          views and experiences are important. Pupil insight is valuable as they often know the grounds
          better than most, including hideaway places and what happens on windy, wet or hot days. Refer
          to a satellite image of your school, as well as moving around the school grounds to support your
          responses.
        </p>
        <p>
          Select the closest matching statement for each question. Ensure you complete the &#39;Policy and
          Practice&#39; section fully before proceeding to the next section. Please note that an incomplete
          audit will create incomplete results, as the questions interlink with each other.
        </p>
        <p>
          You will be able to view your audit results straight away. If you wish to save a copy, please
          make sure you upload your survey response when online.
        </p>
        <p>
          After completing this audit and gathering the results, engage with the pupils and other staff
          about what you have learned, and agree on what your priorities and plans for improvement are.
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

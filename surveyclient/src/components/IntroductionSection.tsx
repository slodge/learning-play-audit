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
          Learning through Landscapes (LtL) developed this audit tool to help you reflect on and evaluate 
          your outdoor space. Rather than being prescriptive, this audit offers a framework for reflection, 
          encouraging you to consider your education practice, outdoor learning and play, and how well your 
          spaces are adapted to build climate resilience in response to our changing climate.
        </p>
        <p>
          Scientific research has informed us that climate change is reshaping our planet, disrupting 
          ecosystems and communities worldwide. Our school grounds feel these effects directly — but they 
          also present an opportunity to apply nature-based solutions that manage water, improve air 
          quality, and support wildlife and children's wellbeing.
        </p>
        <h2>
          How to use the audit
        </h2>
        <p>
          You should be able to complete the audit in around an hour using your existing knowledge of
          the site and can be done offline.
        </p>
        <h2>
          Who should participate?
        </h2>
        <p>
          We strongly recommend completing this audit as a collaborative activity involving both staff 
          and learners. Different perspectives enrich the process — pupils often have invaluable insights 
          about the grounds, from hidden spots to how spaces function during extreme weather. Their 
          everyday experiences matter.
        </p>
        <h2>
          Practical tips:
        </h2>
        <ul>
          <li>
          Have a satellite image of your school available for reference
          </li>
          <li>
          Walk around the grounds while completing the audit to inform your responses
          </li>
          <li>
          Complete the 'Policy and Practice' section in full before moving to subsequent sections, as 
          questions are interconnected
          </li>
          <li>
          Note that incomplete audits generate incomplete results due to the interlinked nature of the 
          questions
          </li>
        </ul>
        <h2>
          Accessing your results
        </h2>
        <p>
          Your audit results will be available to view upon completing the audit. To save a copy, ensure 
          you upload your survey response when online. This will be sent to your logged on email address.
        </p>
        <h2>
          Next steps
        </h2>
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
          This audit is for non-commercial use only. Copyright Learning through Landscapes 2026
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
        <SectionBottomNavigation />
      </div>
    </>
  );
}

export default IntroductionSection;

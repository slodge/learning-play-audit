import client from "../pageobjects/Client";

describe("Survey Client", () => {
  const timeSuffix = " " + new Date().toLocaleTimeString();
  const optionalRatio = 0.5;

  function setTextField(id, suffix = timeSuffix) {
    client.textArea(id).setValue("test " + id + " value" + timeSuffix);
  }

  function randomScaleValue() {
    const items = ["a", "b", "c", "d"];
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomUserTypeValue() {
    const items = ["a", "b", "c", "d"];
    return items[Math.floor(Math.random() * items.length)];
  }

  function setOptional() {
    return Math.random() <= optionalRatio;
  }

  function setScaleWithComment(id, suffix = timeSuffix) {
    client.questionScale(id, randomScaleValue()).click();
    client.questionCommentButton(id).click();
    client
      .questionCommentTextArea(id)
      .setValue("test " + id + " comment" + timeSuffix);
  }

  function setOptionalScaleWithComment(id, suffix = timeSuffix) {
    if (setOptional()) {
      client.questionScale(id, randomScaleValue()).click();
    }
    if (setOptional()) {
      client.questionCommentButton(id).click();
      client
        .questionCommentTextArea(id)
        .setValue("test " + id + " comment" + timeSuffix);
    }
  }

  function setOptionalUserTypeWithComment(id, suffix = timeSuffix) {
    if (setOptional()) {
      client.questionUserType(id, randomUserTypeValue()).click();
    }
    if (setOptional()) {
      client
        .questionUserTypeComment(id)
        .setValue("test " + id + " comment" + timeSuffix);
    }
  }

  function setOptionalTextField(id, suffix = timeSuffix) {
    if (setOptional()) {
      setTextField(id, suffix);
    }
  }

  function setOptionalTextWithYear(id, suffix = timeSuffix) {
    if (setOptional()) {
      client
        .improvementTextArea(id, 1)
        .setValue("test " + id + " value 1" + timeSuffix);
    }
    if (setOptional()) {
      client.yearTextArea(id, 1).setValue("2000");
    }
    if (setOptional()) {
      client
        .improvementTextArea(id, 2)
        .setValue("test " + id + " value 2" + timeSuffix);
    }
    if (setOptional()) {
      client.yearTextArea(id, 2).setValue("2010");
    }
    if (setOptional()) {
      client
        .improvementTextArea(id, 3)
        .setValue("test " + id + " value 3" + timeSuffix);
    }
    if (setOptional()) {
      client.yearTextArea(id, 3).setValue("2020");
    }
  }


  it("complete survey", () => {
    client.open();
    browser.setTimeout({ script: 120000 });

    client.navMenuLink("Background Information").click();
    setTextField("background-school");
    setOptionalTextField("background-localauthority");
    setTextField("background-contactname");
    setOptionalUserTypeWithComment("background-position");
    setOptionalTextField("background-telephone");
    setTextField("background-email");

    client.navMenuLink("Learning in Your Grounds").click();
    setOptionalScaleWithComment("learning-science");
    setOptionalScaleWithComment("learning-maths");
    setOptionalScaleWithComment("learning-languages");
    setOptionalScaleWithComment("learning-arts");
    setOptionalScaleWithComment("learning-RME");
    setOptionalScaleWithComment("learning-social");
    setOptionalScaleWithComment("learning-technologies");
    setOptionalScaleWithComment("learning-classroom");
    setOptionalScaleWithComment("learning-seating");
    setOptionalScaleWithComment("learning-sheltered");
    setOptionalScaleWithComment("learning-disturbance");

    client.navMenuLink("Play").click();
    setOptionalScaleWithComment("play-climbing");
    setOptionalScaleWithComment("play-balancing");
    setOptionalScaleWithComment("play-swinging");
    setOptionalScaleWithComment("play-jumping");
    setOptionalScaleWithComment("play-trails");
    setOptionalScaleWithComment("play-slopes");
    setOptionalScaleWithComment("play-physical");
    setOptionalScaleWithComment("play-markings");
    setOptionalScaleWithComment("play-targets");
    setOptionalScaleWithComment("play-grass");
    setOptionalScaleWithComment("play-woodland");
    setOptionalScaleWithComment("play-bark");
    setOptionalScaleWithComment("play-straw");
    setOptionalScaleWithComment("play-soil");
    setOptionalScaleWithComment("play-sand");
    setOptionalScaleWithComment("play-den");
    setOptionalScaleWithComment("play-storage");
    setOptionalScaleWithComment("play-trunks");
    setOptionalScaleWithComment("play-bushes");
    setOptionalScaleWithComment("play-rocks");
    setOptionalScaleWithComment("play-tyres");

    client.navMenuLink("Wellbeing").click();
    setOptionalScaleWithComment("wellbeing-seating");
    setOptionalScaleWithComment("wellbeing-seatingsizes");
    setOptionalScaleWithComment("wellbeing-shelterwind");
    setOptionalScaleWithComment("wellbeing-shelterrain");
    setOptionalScaleWithComment("wellbeing-shade");
    setOptionalScaleWithComment("wellbeing-schoolmeals");
    setOptionalScaleWithComment("wellbeing-packedlunches");
    setOptionalScaleWithComment("wellbeing-socialspaces");
    setOptionalScaleWithComment("wellbeing-colourful");
    setOptionalScaleWithComment("wellbeing-quiet");
    setOptionalScaleWithComment("wellbeing-attractive");
    setOptionalScaleWithComment("wellbeing-outdoorart");
    setOptionalScaleWithComment("wellbeing-goodimpression");

    client.navMenuLink("Sustainability").click();
    setOptionalScaleWithComment("sustainability-trees");
    setOptionalScaleWithComment("sustainability-flowers");
    setOptionalScaleWithComment("sustainability-shrubs");
    setOptionalScaleWithComment("sustainability-meadow");
    setOptionalScaleWithComment("sustainability-ponds");
    setOptionalScaleWithComment("sustainability-deadwood");
    setOptionalScaleWithComment("sustainability-birdboxes");
    setOptionalScaleWithComment("sustainability-bughotels");
    setOptionalScaleWithComment("sustainability-nature");
    setOptionalScaleWithComment("sustainability-cycle");
    setOptionalScaleWithComment("sustainability-composting");
    setOptionalScaleWithComment("sustainability-litterbins");
    setOptionalScaleWithComment("sustainability-renewableenergy");
    setOptionalScaleWithComment("sustainability-growingfood");
    setOptionalScaleWithComment("sustainability-fruittrees");

    client.navMenuLink("Community and Participation").click();
    setOptionalScaleWithComment("community-pupilsdesign");
    setOptionalScaleWithComment("community-parentsdesign");
    setOptionalScaleWithComment("community-staffdesign");
    setOptionalTextWithYear("community-datedImprovements");
    setOptionalScaleWithComment("community-managegrowing");
    setOptionalScaleWithComment("community-managelitter");
    setOptionalScaleWithComment("community-manageother");
    setOptionalScaleWithComment("community-childrenoutside");
    setOptionalScaleWithComment("community-adultsoutside");
    setOptionalScaleWithComment("community-communityoutside");
    setOptionalTextField("community-othercommunity");

    client.navMenuLink("Local Greenspace").click();
    setOptionalTextField("greenspace-namegreenspace");
    setOptionalScaleWithComment("greenspace-accessible");
    setOptionalTextField("greenspace-improveaccessible");
    setOptionalScaleWithComment("greenspace-frequentuse");
    setOptionalScaleWithComment("greenspace-wildlife");
    setOptionalTextField("greenspace-improvewildlife");
    setOptionalScaleWithComment("greenspace-teaching");
    setOptionalTextField("greenspace-improveteaching");
    setOptionalTextField("greenspace-listowner");
    setOptionalScaleWithComment("greenspace-changes");

    client.navMenuLink("Your Practice").click();
    setOptionalScaleWithComment("practice-developingcurriculum");
    setOptionalScaleWithComment("practice-curriculumtopic");
    setOptionalScaleWithComment("practice-resources");
    setOptionalScaleWithComment("practice-outcomes");
    setOptionalScaleWithComment("practice-principles");
    setOptionalScaleWithComment("practice-growfood");
    setOptionalScaleWithComment("practice-playpolicy");
    setOptionalScaleWithComment("practice-playrain");
    setOptionalScaleWithComment("practice-playsnow");
    setOptionalScaleWithComment("practice-allages");
    setOptionalScaleWithComment("practice-outofsight");
    setOptionalScaleWithComment("practice-typesofplay");
    setOptionalScaleWithComment("practice-monitoring");
    setOptionalScaleWithComment("practice-skillstraining");
    setOptionalScaleWithComment("practice-oldersupervising");

    client.navMenuLink("Your Reflection and Feedback").click();
    setOptionalScaleWithComment("reflection-groundsadvisor");
    setOptionalScaleWithComment("reflection-onlineresources");
    setOptionalScaleWithComment("reflection-CPD");
    setOptionalScaleWithComment("reflection-straightforward");
    setOptionalScaleWithComment("reflection-ideas");

    client.navMenuLink("Submit survey").click();
    client.submitSurveyButton.click();

    browser.debug();
  });
});

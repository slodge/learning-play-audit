/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkPhotoSections"] }] */

import React from "react";
import GallerySection from "./GallerySection";
import { surveyStore } from "../model/SurveyModel";
import { REFRESH_STATE, SET_CURRENT_SECTION } from "../model/ActionTypes";
import { INPUT_STATE, EMPTY_STATE } from "../model/TestUtils";
import { renderWithStore } from "./ReactTestUtils";
import { GALLERY, RESULTS, SUBMIT } from "../model/SurveySections";
import { waitFor } from "@testing-library/dom";
import getPhotoUuid from "../model/SurveyPhotoUuid";

describe("component GallerySection", () => {

  it("gallery has been disabled", () => {
  })

  return;

  beforeEach(() => {
    // Populate state and auth state
    surveyStore.dispatch({ type: REFRESH_STATE, state: INPUT_STATE });
    surveyStore.dispatch({ type: SET_CURRENT_SECTION, sectionId: GALLERY });
  });

  it("initial empty state", () => {
    surveyStore.dispatch({ type: REFRESH_STATE, state: EMPTY_STATE });
    const { container } = renderWithStore(<GallerySection />);

    const photoSections = container.querySelectorAll(
      ".gallery-section-question"
    );
    expect(photoSections).toHaveLength(0);
  });

  it("initial state with photos", async () => {
    const { container } = renderWithStore(<GallerySection />);

    await checkPhotoSections(container, [
      {
        sectionId: "general",
        title: "General",
        photos: [
          {
            description: "test photo3",
            imageData: Buffer.from("image data3").toString("base64"),
          },
        ],
      },
      {
        sectionId: "wellbeing-colourful",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          {
            description: "test photo1",
            imageData: Buffer.from("image data1").toString("base64"),
          },
          {
            description: "test photo2",
            imageData: Buffer.from("image data2").toString("base64"),
          },
        ],
      },
    ]);
  });

  it("add photo", async () => {
    const { container, user } = renderWithStore(<GallerySection />);
    (getPhotoUuid as jest.Mock).mockImplementation(() => "newPhoto1");

    await user.upload(container.querySelector("#icon-button-add-photo")!, [
      new File(["new imageData4"], `file1`, { type: "image/jpg" }),
    ]);

    await checkPhotoSections(container, [
      {
        sectionId: "general",
        title: "General",
        photos: [
          {
            description: "test photo3",
            imageData: Buffer.from("image data3").toString("base64"),
          },
          {
            description: "",
            imageData: Buffer.from("new imageData4").toString("base64"),
          },
        ],
      },
      {
        sectionId: "pandp",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          {
            description: "test photo1",
            imageData: Buffer.from("image data1").toString("base64"),
          },
          {
            description: "test photo2",
            imageData: Buffer.from("image data2").toString("base64"),
          },
        ],
      },
    ]);
  });

  it("add photo and click confirm", async () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => "newPhoto1");
    const { container, user } = renderWithStore(<GallerySection />);
    expect(confirmButton()).toBeNull();

    await user.upload(container.querySelector("#icon-button-add-photo")!, [
      new File(["new imageData3"], `file1`, { type: "image/jpg" }),
    ]);
    expect(confirmButton()).not.toBeNull();
    await user.click(confirmButton()!);

    expect(confirmButton()).toBeNull();
  });

  it("add photo and click backdrop", async () => {
    (getPhotoUuid as jest.Mock).mockImplementation(() => "newPhoto1");
    const { container, user } = renderWithStore(<GallerySection />);
    expect(confirmButton()).toBeNull();

    await user.upload(container.querySelector("#icon-button-add-photo")!, [
      new File(["new imageData3"], `file1`, { type: "image/jpg" }),
    ]);
    expect(confirmButton()).not.toBeNull();
    const confirmBackdrop = document.querySelector(
      "#confirm-dialog-container div:first-child"
    )!;
    await user.click(confirmBackdrop);

    expect(confirmButton()).toBeNull();
  });

  it("add multiple photos", async () => {
    (getPhotoUuid as jest.Mock)
      .mockImplementationOnce(() => "newPhoto1")
      .mockImplementationOnce(() => "newPhoto2");
    const { container, user } = renderWithStore(<GallerySection />);
    const files = ["new imageData4", "new imageData5"].map(
      (data, i) => new File([data], `file${i}`, { type: "image/jpg" })
    );
    await user.upload(
      container.querySelector("#icon-button-add-photo")!,
      files
    );

    await checkPhotoSections(container, [
      {
        sectionId: "general",
        title: "General",
        photos: [
          {
            description: "test photo3",
            imageData: Buffer.from("image data3").toString("base64"),
          },
          {
            description: "",
            imageData: Buffer.from("new imageData4").toString("base64"),
          },
          {
            description: "",
            imageData: Buffer.from("new imageData5").toString("base64"),
          },
        ],
      },
      {
        sectionId: "wellbeing-colourful",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          {
            description: "test photo1",
            imageData: Buffer.from("image data1").toString("base64"),
          },
          {
            description: "test photo2",
            imageData: Buffer.from("image data2").toString("base64"),
          },
        ],
      },
    ]);
  });

  it("change photo description", async () => {
    const { container, getAllByRole, user } = renderWithStore(
      <GallerySection />
    );

    const descriptionField = getAllByRole("textbox", {
      name: "Photo description",
    })[0];
    await user.clear(descriptionField);
    await user.type(descriptionField, "new description");

    await checkPhotoSections(container, [
      {
        sectionId: "general",
        title: "General",
        photos: [
          {
            description: "new description",
            imageData: Buffer.from("image data3").toString("base64"),
          },
        ],
      },
      {
        sectionId: "wellbeing-colourful",
        title:
          "Wellbeing - Entrances and signs are colourful, bright, happy and welcoming.",
        photos: [
          {
            description: "test photo1",
            imageData: Buffer.from("image data1").toString("base64"),
          },
          {
            description: "test photo2",
            imageData: Buffer.from("image data2").toString("base64"),
          },
        ],
      },
    ]);
  });

  it("bottom navigation", async () => {
    const { getByRole, user } = renderWithStore(<GallerySection />);

    await user.click(getByRole("button", { name: "previous section" }));
    expect(surveyStore.getState().currentSectionId).toBe(RESULTS);

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe(GALLERY);

    await user.click(getByRole("button", { name: "next section" }));
    expect(surveyStore.getState().currentSectionId).toBe(SUBMIT);
  });

  const confirmButton = () => document.querySelector(".dialog #ok-button");

  interface ExpectedSectionData {
    sectionId: string;
    title: string;
    photos: { description: string; imageData: string }[];
  }

  async function checkPhotoSections(
    container: HTMLElement,
    expectedSections: ExpectedSectionData[]
  ) {
    const expectedPhotoCount = expectedSections.reduce(
      (count, section) => count + section.photos.length,
      0
    );
    await waitFor(() => {
      expect(container.querySelectorAll(".photo-container")).toHaveLength(
        expectedPhotoCount
      );
    });

    let sections = container.querySelectorAll(".gallery-section-question");
    expect(sections).toHaveLength(expectedSections.length);

    expectedSections.forEach((expectedSection, i) => {
      const section = sections[i];
      expect(section).toHaveAttribute("id", expectedSection.sectionId);
      expect(section.querySelector("h3")).toHaveTextContent(
        expectedSection.title
      );

      const expectedPhotos = expectedSection.photos;
      const photos = section.querySelectorAll(".photo-container");
      expect(photos).toHaveLength(expectedPhotos.length);
      expectedPhotos.forEach((expectedPhoto, p) => {
        const photo = photos[p];
        expect(photo.querySelector("textarea")).toHaveTextContent(
          expectedPhoto.description
        );
        expect(photo.querySelector("img")!).toHaveAttribute(
          "src",
          "data:image/jpeg;base64," + expectedPhoto.imageData
        );
      });
    });
  }
});

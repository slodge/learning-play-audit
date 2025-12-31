import {
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Chart,
  ChartConfiguration,
  ScaleOptions,
  PieController,
  ArcElement,
  Legend,
} from "chart.js";
import {
  sectionsContent,
  SCALE_WITH_COMMENT,
  PERCENTAGE_TYPE_WITH_COMMENT,
  ResultMapping,
  all_results,
  Result,
  Question,
  result_mappings
} from "learning-play-audit-survey";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { AnswerWeights, QuestionAnswer, SurveyAnswers } from "./SurveyModel";
import { group } from "console";

// eslint-disable-next-line jest/require-hook
Chart.register(BarController, BarElement, CategoryScale, LinearScale);


Chart.register(
  BarController, BarElement, CategoryScale, LinearScale, 
  PieController, ArcElement, 
  //ChartDataLabels,
  Legend
);

const A_ANSWER_VALUES = { a: 3, b: 2, c: 1, d: 0, max: 3 };
const B_ANSWER_VALUES = { a: 0, b: 1, c: 2, d: 3, max: 3 };
const GEO_ANSWER_VALUES = { a: 0, b: 3, c: 12, d: 30, e: 60, "": 0 };
type A_ANSWER_VALUE_KEY = keyof typeof A_ANSWER_VALUES;
type B_ANSWER_VALUE_KEY = keyof typeof B_ANSWER_VALUES;

const width = 600; //px
const backgroundColour = "white";
const largeChartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height: 300,
  backgroundColour,
});
const smallChartJSNodeCanvas = new ChartJSNodeCanvas({
  width,
  height: 150,
  backgroundColour,
});

function getSingleAnswer(
  answers: SurveyAnswers,
  sectionId: string,
  questionId: string,
  answerValues: Record<string, number>
) {
  const answer = answers[sectionId][questionId] as QuestionAnswer;
  var answerValue = 0;
  if (!answer) {
    throw new Error("Unknown question: " + sectionId + ":" + questionId);
  }
  if (answer.answer && answerValues.hasOwnProperty(answer.answer)) {
    answerValue = answerValues[answer.answer];
  }
  return { value: answerValue, maxValue: answerValues.max };
}

function calcResultAnswers(answers: SurveyAnswers, resultMapping: ResultMapping) {
  var totalValue = 0;
  var totalMaxValue = 0;
  resultMapping.A.forEach((pair) => {
    const { value, maxValue } = getSingleAnswer(answers, pair.section, pair.question, A_ANSWER_VALUES);
    totalValue += value;
    totalMaxValue += maxValue;
  });
  resultMapping.B.forEach((pair) => {
    const { value, maxValue } = getSingleAnswer(answers, pair.section, pair.question, B_ANSWER_VALUES);
    totalValue += value;
    totalMaxValue += maxValue;
  });
  return (totalValue * 100) / totalMaxValue;
}

function getChartConfiguration(
  labels: (string | string[])[],
  data: number[],
  barColour: string[]
): ChartConfiguration {
  const valueAxis: ScaleOptions = {
    type: "linear",
    grid: { color: "#807d7d", z: 1 },
    min: 0,
    max: 100,
    beginAtZero: true,
    ticks: { font: { size: 14 } },
  };

  const categoryAxis: ScaleOptions = {
    type: "category",
    grid: { color: "#807d7d", z: 1 },
    ticks: { font: { size: 16, weight: "bold" } },
  };

  return {
    type: "bar",
    options: {
      plugins: { legend: { display: false } },
      layout: { padding: 10 },
      scales: { x: valueAxis, y: categoryAxis },
      indexAxis: "y",
    },
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: barColour,
          borderColor: barColour,
          hoverBackgroundColor: barColour,
          hoverBorderColor: barColour,
          categoryPercentage: 0.9,
          maxBarThickness: 55,
        },
      ],
    },
  };
}

// for all the results, which have sections names like "Foo: Bar" group them by Foo
const groupedResults = all_results.reduce((acc: Record<string, Result[]>, result) => {
  const sectionParts = result.section.split(":");
  const groupName = sectionParts[0].trim();
  if (!acc[groupName]) {
    acc[groupName] = [];
  }
  acc[groupName].push(result);
  return acc;
}, {});   

const gcQuestionsArray: Question[] = sectionsContent.find(s => s.id == "nature")?.subsections.flatMap(ss => ss.questions.filter(q => q.id.startsWith("GC"))) || [];
// const gcQuestions: Map<string, Question> = gcQuestionsArray.reduce((acc: Map<string, Question>, question:Question) => {
//   acc.set(question.id, question);
//   return acc;
// }, new Map());

export interface SurveyChart {
  title: string;
  explodeResults: boolean;
  labels: string[];
  results: number[];
  resultColours: string[];
  statements: string[];
  chart: Buffer;
}


function getGeoPieChart(answers: SurveyAnswers) : SurveyChart {

  const geo_answer_keys = Object.keys(answers.nature).filter(key => key.startsWith("GC"));
  const results: number[] = [];
  const labels: string[] = [];

  gcQuestionsArray.forEach(question => {
    const { value } = getSingleAnswer(answers, "nature", question.id, GEO_ANSWER_VALUES);
    const modifiedText = question.text.toString()
                              .replace("What area of grounds is ", "")
                              .replace("covered by ", "")
                              .replace("?", "");
    results.push(value);
    labels.push(modifiedText);
  });

  const data = {
        datasets: [{
            data: results,
            // not sure about this being fixed size of 8...
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
              '#9966FF', '#FF9F40', '#C9CBCF', '#1A6C9C'
            ],
        }],
        labels: labels
    };

    const config: ChartConfiguration = {
        type: 'pie',
        data: data,
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'right' as const,
              labels: {
                font: { size: 10 }
              }
            }
          }
        }
    };

    const buffer = largeChartJSNodeCanvas.renderToBuffer(config);

    return {
      title: "Grounds Coverage",
      labels: labels,
      results: results,
      chart: buffer,
      explodeResults: false,
    }
}

export async function getCharts(answers: SurveyAnswers): Promise<SurveyChart[]> {
  const toReturn: SurveyChart[] = [];

  toReturn.push(getGeoPieChart(answers));

  for (var key in Object.keys(groupedResults)) {
    const groupName = Object.keys(groupedResults)[key];
    const group = groupedResults[groupName];
    const mappings = group.map(result => result_mappings[result.section]);
  
    const results = mappings.map(mapping => calcResultAnswers(answers, mapping));
    const resultColours = results.map(result => {
      if (result >= 67) {
        return "#4caf50"; // green
      } else if (result >= 34) {
        return "#ff9800"; // orange
      } else {
        return "#f44336"; // red
      }
    });

    let labels = group.map(result => result.section.split(":")[1].trim());
    
    const chartConfiguration = getChartConfiguration(
      labels, 
      results,
      resultColours
    );

    const chart = await largeChartJSNodeCanvas.renderToBuffer(chartConfiguration);

    const statements = results.map((result, index) => {
      const spec = group[index];
      if (result >= 67) {
        return spec.good;
      } else if (result >= 34) {
        return spec.ok
      } else {
        return spec.bad;
      }
    });

    toReturn.push({ 
      title: groupName, 
      labels: labels,
      results: results,
      resultColours: resultColours,
      statements: statements,
      chart: chart,
      explodeResults: true,
    });
  }

  return toReturn;
}

import React, { useRef, useEffect, MutableRefObject, useState } from "react";
import "../App.css";
import { useSelector } from "react-redux";
import {
  BarController,
  BarElement,
  PieController,
  CategoryScale,
  LinearScale,
  Chart,
  ChartConfiguration,
  ScaleOptions,
  ArcElement,
  Legend,
} from "chart.js";
//import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  FixedCognitoUser
} from "learning-play-audit-shared"
import {
  SCALE_WITH_COMMENT,
  sectionQuestions,
  sectionsContent,
  all_results,
  ResultMapping,
  AllResultMappings,
  result_mappings,
  Result,
  Question
} from "learning-play-audit-survey";
import SectionBottomNavigation from "./SectionBottomNavigation";
import {
  getAnswers,
  QuestionAnswer,
} from "../model/SurveyModel";
import { key } from "localforage";

// eslint-disable-next-line jest/require-hook
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

type ChartInstanceWrapper = {
  chartInstance: MutableRefObject<Chart | null>;
  chartContainer: MutableRefObject<HTMLCanvasElement | null>;
  smallInstance: MutableRefObject<Chart | null>;
  smallContainer: MutableRefObject<HTMLCanvasElement | null>;
  textOutput: MutableRefObject<HTMLDivElement | null>;
};

function ResultsSection() {
  const answers = useSelector(getAnswers);
  const chartWrappers: Map<string, ChartInstanceWrapper> = new Map();
  const GEO_CHART:string = "Geographical Diversity";

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

  Object.keys(groupedResults).forEach(groupName => {
    const group = groupedResults[groupName];
    chartWrappers.set(groupName, {
      chartInstance: useRef<Chart | null>(null),
      chartContainer: useRef<HTMLCanvasElement | null>(null),
      smallInstance: useRef<Chart | null>(null),
      smallContainer: useRef<HTMLCanvasElement | null>(null),
      textOutput: useRef<HTMLDivElement | null>(null),
    });
  });

  chartWrappers.set(GEO_CHART, {
    chartInstance: useRef<Chart | null>(null),
    chartContainer: useRef<HTMLCanvasElement | null>(null),
    smallInstance: useRef<Chart | null>(null),
    smallContainer: useRef<HTMLCanvasElement | null>(null),
    textOutput: useRef<HTMLDivElement | null>(null),
  });

  const gcQuestionsArray = sectionsContent.find(s => s.id == "nature")?.subsections.flatMap(ss => ss.questions.filter(q => q.id.startsWith("GC"))) || [];
  const gcQuestions: Map<string, Question> = gcQuestionsArray.reduce((acc: Map<string, Question>, question:Question) => {
    acc.set(question.id, question);
    return acc;
  }, new Map());

  useEffect(() => {
    function getSingleAnswer(sectionId: string, questionId: string, answerValues: Record<string, number>) {
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

    function chartFrom(resultMapping: ResultMapping) {
      var totalValue = 0;
      var totalMaxValue = 0;
      resultMapping.A.forEach((pair) => {
        const { value, maxValue } = getSingleAnswer(pair.section, pair.question, A_ANSWER_VALUES);
        totalValue += value;
        totalMaxValue += maxValue;
      });
      resultMapping.B.forEach((pair) => {
        const { value, maxValue } = getSingleAnswer(pair.section, pair.question, B_ANSWER_VALUES);
        totalValue += value;
        totalMaxValue += maxValue;
      });
      return (totalValue * 100) / totalMaxValue;
    }

    function updateChart(
      chartContainer: MutableRefObject<HTMLCanvasElement | null>,
      chartInstance: MutableRefObject<Chart | null>,
      labels: (string | string[])[],
      data: number[],
      barColour: string[],
      small = false
    ) {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }

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

      const configuration: ChartConfiguration = {
        type: "bar",
        options: {
          animation: {
            duration: 0,
          },
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 10 },
          scales: {
            x: small ? categoryAxis : valueAxis,
            y: small ? valueAxis : categoryAxis,
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          indexAxis: small ? "x" : "y",
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

      const chartRef = chartContainer.current!.getContext("2d");
      chartInstance.current = new Chart(chartRef!, configuration);
    }

    function updatePieChart(
      chartContainer: MutableRefObject<HTMLCanvasElement | null>,
      chartInstance: MutableRefObject<Chart | null>,
      data: any,
      small = false
    ) {
      if (chartInstance.current !== null) {
        chartInstance.current.destroy();
      }

      const configuration: ChartConfiguration = {
        type: "pie",
        options: {
          animation: {
            duration: 0,
          },
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: 10 },
          plugins: {
                legend: {
                  display: true,
                  position: 'right',
                },
                /*
                removed this as coudn't get the spacing to work nicely
                datalabels: {
                  color: '#000',
                  align: 'end',
                  anchor: 'end',
                  formatter: (value, ctx) => ctx.chart.data.labels?.[ctx.dataIndex], // Show labels
                },
                */
          }
        },
        data: data
      };

      const chartRef = chartContainer.current!.getContext("2d");
      chartInstance.current = new Chart(chartRef!, configuration);
    }


    function updateGeoCharts() {
      let chartWrapper = chartWrappers.get(GEO_CHART);
      
      if (!chartWrapper) {
        throw new Error("No chart wrapper for key: " + GEO_CHART);
      }

      let geo_answer_keys = Object.keys(answers.nature).filter(key => key.startsWith("GC"));
      let resultValues: Map<string, number> = new Map();
      
      const data = {
            datasets: [{
                data: [] as number[],
                // not sure about this being fixed size of 8...
                backgroundColor: [
                  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                  '#9966FF', '#FF9F40', '#C9CBCF', '#1A6C9C'
                ],
            }],
            labels: [] as string[]
        };

      for (let key in geo_answer_keys) {
        const answer = answers.nature[geo_answer_keys[key]] as QuestionAnswer;
        const answerValue = GEO_ANSWER_VALUES[answer.answer as keyof typeof GEO_ANSWER_VALUES];

        data.datasets[0].data.push(answerValue);
        const rawLabel = gcQuestions.get(geo_answer_keys[key])!.text as string;
        const label = rawLabel.replace("What area of grounds is ", "")
                          .replace("covered by ", "")
                          .replace("?", "");
        data.labels.push(label);
      }
      
      updatePieChart(
        chartWrapper.smallContainer,
        chartWrapper.smallInstance,
        data,
        true
      );

      updatePieChart(
        chartWrapper.chartContainer,
        chartWrapper.chartInstance,
        data,
        false
      );

      const chartRef =  chartWrapper?.textOutput.current;
      chartRef?.replaceChildren("");
      chartRef?.insertAdjacentHTML("beforeend", "<p /><hr /><p />");   
    }

    function updateCharts(
      groupName: string,
      group: Result[]
    ) {
      let chartWrapper = chartWrappers.get(groupName);

      if (!chartWrapper) {
        throw new Error("No chart wrapper for key: " + groupName);
      }

      let results = group.map(result => chartFrom(result_mappings[result.section]));
      let resultColours = results.map(result => {
        if (result >= 67) {
          return "#4caf50"; // green
        } else if (result >= 34) {
          return "#ff9800"; // orange
        } else {
          return "#f44336"; // red
        }
      });

      // create the labels as an array of section names without their leading "Key:" text
      let labels = group.map(result => result.section.split(":")[1].trim());

      updateChart(
        chartWrapper.smallContainer,
        chartWrapper.smallInstance,
        labels,
        results,
        resultColours,
        true
      );

      updateChart(
        chartWrapper.chartContainer,
        chartWrapper.chartInstance,
        labels,
        results,
        resultColours,
        false
      );

      const chartRef =  chartWrapper?.textOutput.current;
       
      // remove all children from chartRef
      chartRef?.replaceChildren("");

      group.forEach((result, index) => {
        const subSectionName = result.section.split(":")[1].trim();
        const resultText = results[index] >= 67 ? result.good : results[index] >= 34 ? result.ok : result.bad;
        const className = results[index] >= 67 ? "text-good" : results[index] >= 34 ? "text-ok" : "text-bad";
        chartRef?.insertAdjacentHTML("beforeend", `<h4>${subSectionName}: <span class="${className}">${results[index].toFixed(1)}%</span></h4>`);
        chartRef?.insertAdjacentHTML("beforeend", `<p class="${className}">${resultText}</p>`);      
      });
   
      // lazy way to add spacing at the end...
      chartRef?.insertAdjacentHTML("beforeend", "<p /><hr /><p />");   
    }

    Object.keys(groupedResults).forEach(groupName => {
      const group = groupedResults[groupName];
      updateCharts(groupName, group);
      updateGeoCharts();
    });

  }, [answers]);

  function createAreaChartHolder() {
    return createChartHolder(GEO_CHART);
  }

  function createChartHolder(groupName: string) {
    const node: React.ReactNode[] = [];
    node.push(
      <h2>{groupName}</h2>
    );
    const chartWrapper = chartWrappers.get(groupName);
    node.push(
      <div>
        <div className="results-chart five-bars">
          <canvas className="small-chart" ref={chartWrapper?.smallContainer} />
          <canvas className="large-chart" ref={chartWrapper?.chartContainer} />
        </div>
        <div>
          <div ref={chartWrapper?.textOutput} />
        </div>
      </div>
  );
    return node;
  }

  return (
    <div className="section results">
      {createAreaChartHolder()}
      {Object.keys(groupedResults).map(createChartHolder)}
      <SectionBottomNavigation />
    </div>
  );
}

export default ResultsSection;

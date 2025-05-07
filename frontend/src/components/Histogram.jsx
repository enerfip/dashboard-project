import CanvasJSReact from '@canvasjs/react-charts';
import { useEffect, useState } from 'react';
import { getEnerfipQueryResult, parseEnerfipResponse } from '../enerfip_api/client';

const { CanvasJSChart } = CanvasJSReact;

function Chart() {

  const [collectedAmountByMonth, setCollectedAmountByMonth] = useState([]);
  const [monthlyAmountLastYear, setMonthlyAmountLastYear] = useState([]);
  const [monthlyAmountCurrentYear, setMonthlyAmountCurrentYear] =  useState([]);
  const [cumulativeAmountLastYear, setCumulativeAmountLastYear] = useState([]);
  const [cumulativeAmountCurrentYear, setCumulativeAmountCurrentYear] = useState([]);
  const currentMonth = new Date().getMonth();
  const currentSemester = currentMonth < 6 ? 1 : 2;


  const retrieveAmountForDisplay = async (queryId, apiKey) => {
    const rawData = await getEnerfipQueryResult(queryId, apiKey); // returns response.data from redash query
    return parseEnerfipResponse(rawData);
  };


  const retreiveCollectedAmountByMonth = async () => {
    const monthlyAmounts = await retrieveAmountForDisplay(805, "SJMTKOS2Hb7dqGVOP8urA284ApO2sy2meCcr1rig");
    setCollectedAmountByMonth(monthlyAmounts);
  };  


  const retreiveMonthlyAmountLastYear = () => {
    const amountLastYear = collectedAmountByMonth
      .filter(row => new Date(row.month)
      .getFullYear() === (new Date().getFullYear() - 1))
      .map(row => row.collected_by_month);
    setMonthlyAmountLastYear(amountLastYear);
  };


  const retreiveMonthlyAmountCurrentYear = async () => {
    const amountCurrentYear = collectedAmountByMonth
      .filter(row => new Date(row.month)
      .getFullYear() === new Date()
      .getFullYear()).map(row => row.collected_by_month);
    setMonthlyAmountCurrentYear(amountCurrentYear);
  };

  const calculateCumulativeAmounts = (monthlyAmounts) => {
    let cumulativeAmounts = [];
    let total = 0;
    monthlyAmounts.forEach(amount => {
      total += amount;
      cumulativeAmounts.push(total);
    });
    return cumulativeAmounts;
  };

  useEffect(() => {
    retreiveCollectedAmountByMonth();
  }, []);
 
  useEffect(() => {
    const refreshTimeOut = setInterval(() => {
      retreiveCollectedAmountByMonth();
    }, 60000);
    return () => clearInterval(refreshTimeOut);
  }, []);

  useEffect(() => {
    retreiveMonthlyAmountLastYear();
    retreiveMonthlyAmountCurrentYear();
  }, [collectedAmountByMonth]);

  useEffect(() => {
    setCumulativeAmountLastYear(calculateCumulativeAmounts(monthlyAmountLastYear));
    setCumulativeAmountCurrentYear(calculateCumulativeAmounts(monthlyAmountCurrentYear));
  }, [monthlyAmountLastYear, monthlyAmountCurrentYear]);

  const amountsComparisonOptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
          text: "Comparatif des montants collectés",
          fontFamily: "MuseoModerno",
          fontColor: "#1A4C2D"
      },
      axisX: {
          valueFormatString: "MMM",
          intervalType: "month",
          interval: 1,
          labelFontSize: 20
      },
      axisY: {
          title: "En millions d'euros",
          interval: 2.5,
          minimum: 5,
          labelFontSize: 20
      },
      toolTip: {
          shared: true
      },
      legend: {
          cursor: "pointer",
          itemclick: function (e) {
              e.dataSeries.visible = typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ? false : true;
              e.chart.render();
          },
          fontSize: 20,
      },
      data: [
          {
              type: "line",
              lineThickness: 5,
              markerSize: 10,
              name: `${new Date().getFullYear() - 1}`,
              showInLegend: true,
              yValueFormatString: "#,###M€",
              dataPoints: monthlyAmountLastYear.map((amount, index) => ({
                x: new Date(new Date().getFullYear(), index, 1), // Janvier à Décembre 2023
                y: amount / 1000000 // Convertir en millions d'euros
            }))
          },
          {
              type: "line",
              lineThickness: 5,
              markerSize: 10,
              name: `${new Date().getFullYear()}`,
              showInLegend: true,
              yValueFormatString: "#,###M€",
              dataPoints: monthlyAmountCurrentYear.map((amount, index) => ({
                x: new Date(new Date().getFullYear(), index, 1), // Janvier à Décembre 2024
                y: amount / 1000000 // Convertir en millions d'euros
            }))
          },
      ]
  };

  // Comparatif des cumuls S1
  const cumulativeComparisonOptionsS1 = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Semestre 1",
      fontSize: 20,
      fontFamily: "MuseoModerno"
    },
    axisX: {
      valueFormatString: "MMM",
      intervalType: "month",
      interval: 1,
      labelFontSize: 20
    },
    axisY: {
      title: "En millions d'euros",
      minimum: 0,
      maximum: 100,
      interval: 20,
      labelFontSize: 20
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      itemclick: function (e) {
        e.dataSeries.visible = typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ? false : true;
        e.chart.render();
      },
      fontSize: 20,
    },
    data: [
      {
        type: "line",
        lineThickness: 5,
        markerSize: 10,
        name: `${new Date().getFullYear() - 1}`,
        showInLegend: true,
        yValueFormatString: "#,###M€",
        dataPoints: cumulativeAmountLastYear.slice(0, 6).map((amount, index) => ({
          x: new Date(new Date().getFullYear(), index, 1),
          y: amount / 1000000
        }))
      },
      {
        type: "line",
        lineThickness: 5,
        markerSize: 10,
        name: `${new Date().getFullYear()}`,
        showInLegend: true,
        yValueFormatString: "#,###M€",
        dataPoints: cumulativeAmountCurrentYear.slice(0, 6).map((amount, index) => ({
          x: new Date(new Date().getFullYear(), index, 1),
          y: amount / 1000000
        }))
      },
    ]
  };

  // Comparatif des cumuls S2
  const cumulativeComparisonOptionsS2 = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Semestre 2",
      fontSize: 20,
      fontFamily: "MuseoModerno"
    },
    axisX: {
      valueFormatString: "MMM",
      intervalType: "month",
      interval: 1,
      labelFontSize: 20
    },
    axisY: {
      title: "En millions d'euros",
      minimum: 100,
      maximum: 200,
      interval: 20,
      labelFontSize: 20
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      itemclick: function (e) {
        e.dataSeries.visible = typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ? false : true;
        e.chart.render();
      },
      fontSize: 20,
    },
    data: [
      {
        type: "line",
        lineThickness: 5,
        markerSize: 10,
        name: `${new Date().getFullYear() - 1}`,
        showInLegend: true,
        yValueFormatString: "#,###M€",
        dataPoints: cumulativeAmountLastYear.slice(6).map((amount, index) => ({
          x: new Date(new Date().getFullYear(), index + 6, 1),
          y: amount / 1000000
        }))
      },
      {
        type: "line",
        lineThickness: 5,
        markerSize: 10,
        name: `${new Date().getFullYear()}`,
        showInLegend: true,
        yValueFormatString: "#,###M€",
        dataPoints: cumulativeAmountCurrentYear.slice(6).map((amount, index) => ({
          x: new Date(new Date().getFullYear(), index + 6, 1),
          y: amount / 1000000
        }))
      },
    ]
  };

    return (
      <>
        <div style={{marginBottom: "4rem"}}>
            <CanvasJSChart options={amountsComparisonOptions} />
        </div>

        <div>
          <h1>Comparatif des cumuls</h1>

          <div>
            {currentSemester == 1 ? (
              <div>
                <CanvasJSChart options={cumulativeComparisonOptionsS1} />
              </div>
            ) : (
              <div>
                <CanvasJSChart options={cumulativeComparisonOptionsS2} />
              </div>
            )}
          </div>
        </div>
      </>
    );
};

export default Chart;

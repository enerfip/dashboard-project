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
          text: "Comparatif des montants collectés"
      },
      axisX: {
          valueFormatString: "MMM",
          intervalType: "month",
          interval: 1,
      },
      axisY: {
          title: "En millions d'euros",
          suffix: "M€",
      },
      toolTip: {
          shared: true
      },
      legend: {
          cursor: "pointer",
          itemclick: function (e) {
              e.dataSeries.visible = typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ? false : true;
              e.chart.render();
          }
      },
      data: [
          {
              type: "line",
              name: `Montant collecté mois par mois l'année ${new Date().getFullYear() - 1}`,
              showInLegend: true,
              yValueFormatString: "#,###M€",
              dataPoints: monthlyAmountLastYear.map((amount, index) => ({
                x: new Date(new Date().getFullYear(), index, 1), // Janvier à Décembre 2023
                y: amount / 1000000 // Convertir en millions d'euros
            }))
          },
          {
              type: "line",
              name: `Montant collecté mois par mois l'année ${new Date().getFullYear()}`,
              showInLegend: true,
              yValueFormatString: "#,###M€",
              dataPoints: monthlyAmountCurrentYear.map((amount, index) => ({
                x: new Date(new Date().getFullYear(), index, 1), // Janvier à Décembre 2024
                y: amount / 1000000 // Convertir en millions d'euros
            }))
          },
      ]
  };

  const cumulativeComparisonOptions = {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Comparatif des cumuls"
    },
    axisX: {
      valueFormatString: "MMM",
      intervalType: "month",
      interval: 1
    },
    axisY: {
      title: "En millions d'euos",
      suffix: "M€"
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      itemclick: function (e) {
        e.dataSeries.visible = typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible ? false : true;
        e.chart.render();
    }
    },
    data: [
      {
        type: "line",
        name: `Cumul des montants collectés l'année ${new Date().getFullYear() - 1}`,
        showInLegend: true,
        yValueFormatString: "#,###M€",
        dataPoints: cumulativeAmountLastYear.map((amount, index) => ({
          x: new Date(new Date().getFullYear(), index, 1),
          y: amount / 1000000
        }))
      },
      {
        type: "line",
        name: `Cumul des montants collectés l'année ${new Date().getFullYear()}`,
        showInLegend: true,
        yValueFormatString: "#,###M€",
        dataPoints: cumulativeAmountCurrentYear.map((amount, index) => ({
          x: new Date(new Date().getFullYear(), index, 1),
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
          <CanvasJSChart options={cumulativeComparisonOptions} />
        </div>
      </>
    );
};

export default Chart;

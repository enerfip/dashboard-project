import { useEffect, useState, useRef } from 'react';
import { getEnerfipQueryResult } from '../enerfip_api/client';
import { parseEnerfipAmountData } from '../enerfip_api/client';
import { convertNumberToEuro } from '../utils/currency_converter';
import SlotCounter from 'react-slot-counter';
import milliong from '../assets/DES-MILLIONGS.gif';
import song from '../assets/Multiplex-Canal.mp3';

function Dashboard() {

  const [totalAmount, setTotalAmount] = useState(0);
  const [amountCurrentYear, setAmountCurrentYear] = useState(0);
  const [previousAmountCurrentYear, setPreviousAmountCurrentYear] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const audioRef = useRef(null);


  const triggerAnimationIfReady = () => {
    const animationThresholdAmount = 10000000.0;
    const differenceAmount = Math.floor(amountCurrentYear/animationThresholdAmount) - Math.floor(previousAmountCurrentYear/animationThresholdAmount);
  
    if (differenceAmount === 1) {
      // Trigger animation
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
      }, 60000);
    }
  }

  const retrieveAmountForDisplay = async (queryId, apiKey) => {
    const rawData = await getEnerfipQueryResult(queryId, apiKey); // returns response.data from redash query
    const collectedAmount = parseEnerfipAmountData(rawData); // rawData.query_result.data.rows[0].collected_amount
    return convertNumberToEuro(collectedAmount); // affichage des chiffre en Euro
  };
  const retreiveTotalAmount = async () => {
    const amount = await retrieveAmountForDisplay(772, "7kScPIQlpk96VM6Oaw9nwQAeuWn0KFirlePkVXDW");
    setTotalAmount(amount);
  };

  const retreiveAmountCurrentYear = async () => {
    const amount = await retrieveAmountForDisplay(739, "nxSL9zPbhQ89auEd9l8lHNXUuBV2AuDFjekTwXKx");
    setAmountCurrentYear(amount);
    console.log("amount current year", amountCurrentYear);
    console.log("previous amount current year", previousAmountCurrentYear)
    
  };
  useEffect(() => {
      retreiveAmountCurrentYear().then(() => setPreviousAmountCurrentYear(amountCurrentYear));
      retreiveTotalAmount();
  }, []);

  useEffect(() => {
    const refreshTimeOut = setInterval(() => {
      setPreviousAmountCurrentYear(amountCurrentYear)
      retreiveAmountCurrentYear();
      retreiveTotalAmount();
      triggerAnimationIfReady();
    }, 60000);
    return () => clearInterval(refreshTimeOut);
  }, []);

  useEffect(() => {
    if (showAnimation && audioRef.current) {
      audioRef.current.play();
    }
  }, [showAnimation]);

  return (
    <>
      <section>
        <div className='totalInvest'>
          <p>Total amount raised : <b><SlotCounter value={totalAmount} /></b></p>
        </div>

        <div className='currentInvest'>
          <p className='currentAmount'><SlotCounter value={amountCurrentYear} /></p>
          <p className='currentYear'>raised in {new Date().getFullYear()}</p>
        </div>

        {showAnimation && (
          <>
            <div className='gifJulien'>
              <img src={milliong} alt="Celebration gif" />
            </div>

            <div className='gifSeb'>
              <img src={milliong} alt="Celebration gif" />
            </div>

            <audio ref={audioRef} src={song} />
          </>
        )}
      </section>
    </>
  )
}

export default Dashboard;

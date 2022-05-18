import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import React, {useState, useEffect} from 'react';
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { useAppSelector, useAppDispatch } from 'redux/hooks'
import { setExpenses, setReload } from 'redux/slices/expensesSlice';
import { categoryData } from 'constant/category';
import { RefresherEventDetail } from '@ionic/core';
import { CLIENT_EMAIL, PRIVATE_KEY, SPREADSHEET_ID } from 'constant/spreadsheet';
import { Expenses } from 'modules/interface';

export const doc = new GoogleSpreadsheet(SPREADSHEET_ID);


const Home: React.FC = () => {
  const reload = useAppSelector((state) => state.expenses.reload)
  const sheetId = useAppSelector((state) => state.expenses.sheetId)
  const dispatch = useAppDispatch()

  const [totalValue, setTotalValue] = useState<number>(0);
  const [latestRow, setLatestRow] = useState<Array<GoogleSpreadsheetRow>>([]);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [categoryMap, setCategoryMap] = useState<Array<Expenses>>([]);

  useEffect(() => {
    async function loadExpensesData() {
      try {
        setShowLoading(true);
  
        await doc.useServiceAccountAuth({
          client_email: CLIENT_EMAIL,
          private_key: PRIVATE_KEY,
        });
  
        // loads document properties and worksheets
        await doc.loadInfo();
        const sheet = doc.sheetsById[sheetId];
        // read rows
        const rows = await sheet.getRows(); // can pass in { limit, offset }
        
        if(rows !== undefined && rows.length > 0) {
          doLatestRow(rows)
          dispatch(setExpenses(rows.reverse()));
          doThisMonthCalculation(rows)
        } else {
          // empty result
          dispatch(setExpenses([]));
          setLatestRow([]);
          setTotalValue(0);
        }
      } catch (e) {
        console.error('MainPage appendSpreadsheet:Error: ', e);
      } finally {
        setShowLoading(false);
      }
    }
    loadExpensesData();
  }, [dispatch, sheetId, reload]);

  const doLatestRow = (rows: Array<GoogleSpreadsheetRow>) => {
    let latestRowLocal = [] as Array<GoogleSpreadsheetRow>;
    let totalValueCal = 0;
    const month = new Date().getMonth();
    rows.forEach((row , index) => {
      // only retrieve 4 records for recent
      if(rows.length > 4 && index > (rows.length - 5)) {
        latestRowLocal.splice(0, 0, row);
      } else if(rows.length <= 4){
        latestRowLocal.splice(0, 0, row);
      }
      // get total count for this month
      if(new Date(row.DateTime).getMonth() === month)
      totalValueCal += Math.round(row.Value * 100) / 100; // *100 /100 2decimal point
    });
    setLatestRow(latestRowLocal);
    setTotalValue(totalValueCal);
  }

  const doThisMonthCalculation = (expenses: Array<GoogleSpreadsheetRow>) => {
    let categoryMapLocal = [] as Array<Expenses>
    const month = new Date().getMonth()
    expenses.forEach(element => {
      if(new Date(element.DateTime).getMonth() === month) {
        if(categoryMapLocal.find(c => c.category === element.Category)) {
          let category = categoryMapLocal.find(c => c.category === element.Category) 
          category!.sum += parseFloat(element.Value)
        } else {
          categoryMapLocal.push({ category: element.Category, sum: parseFloat(element.Value) })
        }
      }
    });
    setCategoryMap(categoryMapLocal)
  }

  const doRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    dispatch(setReload(!reload));
    event.detail.complete();
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Budget</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent>
          </IonRefresherContent>
        </IonRefresher>
        <div>          
          <IonCard routerLink="/month" class={"margin-two"}>
            <IonCardHeader class={"flex-row space-between"}>
              <IonCardTitle className={"card-title"}>This month</IonCardTitle>
              <IonCardTitle className={"card-value"}>$<span style={{marginLeft: "3px"}}>{Math.round(totalValue * 100) / 100}</span></IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {
                categoryMap.map((data, key) => {
                  let category = categoryData.find(c => c.category === data.category)
                  return (
                    <IonBadge key={key} color="primary" className='inline-flex-row align-center mr-s'>
                      <span className='small-icon margin-r-five'><IonIcon icon={category?.icon} /></span>
                      <span>{Math.round(data.sum * 100) / 100}</span>
                    </IonBadge>
                  )
                })
              }
            </IonCardContent>
          </IonCard>

          <IonCard className={"margin-two"} routerLink="/item-list">
            <IonCardHeader>
              <IonCardTitle>
                <div className={"flex-row flex-one align-center space-between"}>
                  <span>Recent</span>
                </div>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className={"flex-column"}>
              {
                latestRow && latestRow.map((row, index) => {
                  let category = categoryData.find(category => category.category === row.Category)
                  return (
                    <div key={index} className={"flex-row align-center space-between margin-b-ten"}>
                      <div className={"flex-row align-center"}>
                        <div className={"thumbnail"}>
                          <IonIcon icon={category?.icon} />
                        </div>
                        <span style={{marginLeft: "5px"}}>{row.Category}</span>
                      </div>
                      <span>
                        {parseFloat(row.Value).toFixed(2)}
                      </span>
                    </div>
                  );
                })
              }
              </div>
            </IonCardContent>
          </IonCard>
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton routerLink="/add">
                <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        </div>
        { showLoading && <div className={"flex-column loading-div align-center p-l"}>
            <IonSpinner name="bubbles" /><span>Loading Data</span>
          </div>
        }
      </IonContent>
    </IonPage>
  );
};

export default Home;

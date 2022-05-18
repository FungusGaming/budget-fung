import React, { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon, IonItem, IonLabel, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar,
} from "@ionic/react";
// import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { categoryData } from '../../constant/category';
import { useAppSelector } from 'redux/hooks'
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router';

const MonthExpenses : React.FC = () => {
  const expenses = useAppSelector((state) => state.expenses.expenses)
  const [category, setCategory] = useState<string>('All');
  let history = useHistory()
  const thisMonth = new Date().getMonth();
  let totalAmount = 0
  let thisMonthExpenses = expenses.filter(e => new Date(e.DateTime).getMonth() === thisMonth && (e.Category === category || category === 'All'))
  thisMonthExpenses.forEach(e => totalAmount += Math.round(e.Value * 100) / 100)
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Expenses List</IonTitle>
          <IonButtons slot="start" >
            <IonButton onClick={() => history.goBack()}><IonIcon icon={arrowBack} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div>
          <IonItem>
            <IonLabel>Category</IonLabel>
            <IonSelect onIonChange={e => setCategory(e.detail.value)} value={category}>
              <IonSelectOption value={'All'} key={'All'}>All</IonSelectOption>
              { categoryData && categoryData.map(c => (
                <IonSelectOption value={c.category} key={c.category}>{c.category}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </div>
        <div>
          {
            thisMonthExpenses && thisMonthExpenses.length > 0 && thisMonthExpenses.map((row, index) => {
              const datetime = new Date(row.DateTime)
              const date = datetime.getDate() + "/" + (datetime.getMonth() + 1) + "/" + datetime.getFullYear();
              let category = categoryData.find(category => category.category === row.Category)
              return (
              <div key={index} className={"flex-row align-center space-between margin-twenty padding-ten-h"}>
                <div className={"flex-row align-center"}>
                <div className={"thumbnail"}>
                  <IonIcon icon={category?.icon} />
                </div>
                <div className={"flex-column"} style={{marginLeft: "10px"}}>
                  <span style={{fontWeight: 600}}>
                    {row.Name}
                  </span>
                  <span style={{fontSize:"12px",color:"var(--ion-color-step-600)", marginTop:"5px",}}>
                    {date}
                  </span>
                </div>
                </div>
                <span>
                  {parseFloat(row.Value).toFixed(2)}
                </span>
              </div>
              );
            })
          }
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle>
            <div className='flex-row align-center space-between'>
              <span>Total</span>
              <span>{Math.round(totalAmount * 100) / 100}</span>
            </div>
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
}

export default MonthExpenses

import React from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon, IonPage, IonTitle, IonToolbar,
} from "@ionic/react";
// import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { categoryData } from '../../constant/category';
import { useAppSelector } from 'redux/hooks'
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router';

const ItemList : React.FC = () => {
  const expenses = useAppSelector((state) => state.expenses.expenses)
  let history = useHistory()
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
            {
              expenses && expenses.map((row, index) => {
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
                    <span>
                      {row.Category}
                    </span>
                    <span>
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
            {/* <IonInfiniteScroll disabled={disableInfiniteScroll} threshold="10px" id={"infiniteScroll"} onIonInfinite={(ev) => {console.log('infinite');fetchData(ev);}}>
                <IonInfiniteScrollContent
                    loadingSpinner={"bubbles"}
                    loadingText={"Loading item"}
                >
                </IonInfiniteScrollContent>
            </IonInfiniteScroll> */}
          </div>
        </IonContent>
      </IonPage>
    );
}

export default ItemList

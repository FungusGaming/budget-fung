import React, { useRef, useState } from "react";
import { useHistory  } from 'react-router'
import { GoogleSpreadsheet } from "google-spreadsheet";
import {
IonButton,
IonButtons,
IonContent,
IonDatetime,
IonHeader,
IonIcon,
IonInput,
IonItem,
IonLabel,
IonModal,
IonPage,
IonSpinner,
IonTitle,
IonToast,
IonToolbar,
} from "@ionic/react";
import { categoryData } from "../../constant/category";
import { useAppDispatch, useAppSelector } from 'redux/hooks'
import { setReload } from 'redux/slices/expensesSlice';
import { arrowBack } from "ionicons/icons";
import { CLIENT_EMAIL, PRIVATE_KEY, SPREADSHEET_ID } from "constant/spreadsheet";
import { numerizeValue } from "modules/function";

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

const AddExpenses: React.FC = () => {
  let history = useHistory();
  const dispatch = useAppDispatch()
  const reload = useAppSelector((state) => state.expenses.reload)
  const sheetId = useAppSelector((state) => state.expenses.sheetId)

  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString()
  );
  const [loading, setLoading] = useState<Boolean>(false);
  const [category, setCategory] = useState<string>("");

  const addExpensesToSpreadsheet = async (row: { [header: string]: string | number | boolean; } | (string | number | boolean)[]) => {
    try {
      setLoading(true);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      // loads document properties and worksheets
      await doc.loadInfo();
      const sheet = doc.sheetsById[sheetId];

      if (sheet !== undefined) {
        const rows = await sheet.addRow(row);
        if (rows !== undefined) {
          toggleToast("Expenses Added")
          setTimeout(() => {
            resetState();
            dispatch(setReload(!reload))
            history.push("/home")
          }, 1000);
        }
      }
    } catch (e) {
      console.log("addExpensesToSpreadsheet: Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setCategory("");
    setName("");
    setSelectedDate(new Date().toISOString());
    setPrice("");
  };

  const addExpenses = () => {
    if(validateExpenses()) {
      const data = {
        Name: name,
        Value: price,
        DateTime: selectedDate,
        Category: category,
      };
      addExpensesToSpreadsheet(data);
    }
  };

  const setCategoryAndFocus = (category: string) => {
    setCategory(category);
    setTimeout(() => inputRef.current.setFocus(), 100);
  };

  const validateExpenses = () => {
    if (!price) {
      toggleToast("Price need to be number")
      return false
    } else {
      return true
    }
  }

  const toggleToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true);
  }

  const inputRef = useRef<any>(null);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add</IonTitle>
          <IonButtons slot="start" >
            <IonButton onClick={() => history.goBack()}><IonIcon icon={arrowBack} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="container">
          {category === "" ? (
            <div className="choice-grid">
              {categoryData &&
                categoryData.map((category, index) => {
                  return (
                    <IonButton
                      key={index}
                      class="category-button button-margin"
                      fill="solid"
                      expand="block"
                      color="primary"
                      size="large"
                      onClick={() => {
                        setCategoryAndFocus(category.category);
                      }}
                    >
                      <div className="flex-column align-center">
                        <IonIcon className="category-icon" icon={category.icon} />
                        <span className="category-text">{category.category}</span>
                      </div>
                    </IonButton>
                  );
                })}
            </div>
          ) : (
            <div className="flex-column flex-one">
              <div className="flex-column flex-one">
              <IonButton
                class="button-margin"
                fill="solid"
                color="primary"
                size="large"
                onClick={() => {
                  setCategory("");
                }}
              >
                <span>{category}</span>
              </IonButton>
              <IonItem>
                <IonLabel position="floating">Price</IonLabel>
                <IonInput
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  value={price}
                  placeholder="Enter Price"
                  ref={inputRef}
                  onIonChange={(e) => {
                    setPrice(numerizeValue(e.detail.value!))
                  }}
                ></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Description</IonLabel>
                <IonInput
                  value={name}
                  placeholder="Love Food"
                  onIonChange={(e) => setName(e.detail.value!)}
                ></IonInput>
              </IonItem>
              <IonItem>
                <IonLabel>Date</IonLabel>
                <IonButton id="open-datetime-modal">{ new Date(selectedDate).toDateString() || "Date Spent" }</IonButton>
                <IonModal trigger="open-datetime-modal">
                  <IonContent force-overscroll="false">
                    <IonDatetime
                      showDefaultButtons
                      presentation="date"
                      placeholder="Select Date"
                      value={selectedDate}
                      onIonChange={(e) => setSelectedDate(e.detail.value!)}
                    />
                  </IonContent>
                </IonModal>
              </IonItem>
              </div>
              <div
                className={"flex-row flex-one justify-center align-flex-end"}
                style={{ textAlign: "center" }}
              >
                <IonButton
                  id="spend-button"
                  color="primary"
                  size="large"
                  onClick={() => addExpenses()}
                >
                  {loading ? <IonSpinner name="bubbles" /> : <span>Spend</span>}
                </IonButton>
              </div>
            </div>
          )}
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={1000}
          />
          
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AddExpenses

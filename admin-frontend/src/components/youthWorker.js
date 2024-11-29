import React, { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  BooleanField,
  BooleanInput,
  SimpleForm,
  TextInput,
  SelectInput,
  EditButton,
  Edit,
  SelectField,
} from 'react-admin';
import { getYouthClubs } from '../utils';

export const YouthWorkerList = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  if (youthClubs.length === 0) {
    return null;
  }

  return (
    <List
      title="Nuorisotyöntekijät"
      bulkActionButtons={false}
      exporter={false}
      pagination={false}
      {...props}
    >
      <Datagrid>
        <FunctionField
          label="Nimi"
          render={(record) => `${record.firstName} ${record.lastName}`}
        />
        <TextField label="Sähköposti" source="email" />
        <SelectField
          label="Kotinuorisotila"
          source="mainYouthClub"
          choices={youthClubs}
        />
        <BooleanField label="Ylläpitäjä" source="isSuperUser" />
        <EditButton className="focusable"/>
      </Datagrid>
    </List>
  );
};

export const YouthWorkerEdit = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  useEffect(() => {
    const targetNode = document;
    const config = { attributes: true, childList: false, subtree: true };

    const checkTitles = () => {
      const title = document.getElementById('alert-dialog-title');
      if (title) {
        title.getElementsByTagName('h2')[0].innerHTML =
          'Poista nuorisotyöntekijä';
      }
    };
    const observer = new MutationObserver(checkTitles);
    observer.observe(targetNode, config);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Edit title="Muokkaa nuorisotyöntekijää" {...props} undoable={false}>
      <SimpleForm variant="standard" margin="normal" redirect="list">
        <TextInput label="Sähköposti" source="email" type="email" />
        <TextInput label="Etunimi" source="firstName" />
        <TextInput label="Sukunimi" source="lastName" />
        <SelectInput
          label="Kotinuorisotila"
          source="mainYouthClub"
          allowEmpty
          choices={youthClubs}
        />
        <BooleanInput label="Ylläpitäjä" source="isSuperUser" className="toggleField"/>
      </SimpleForm>
    </Edit>
  );
};

import React, { useState, useEffect } from 'react';
import { 
    List,
    Datagrid,
    TextField,
    FunctionField,
    BooleanField,
    BooleanInput,
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    required,
    EditButton,
    Edit
 } from 'react-admin';
 import  { getYouthClubs } from '../utils';

export const YouthWorkerList = (props) => (
  <List title="Nuorisotyöntekijät" {...props}>
      <Datagrid>
        <FunctionField label="Nimi" render={record => `${record.firstName} ${record.lastName}`} />
        <TextField label="Sähköposti" source="email" />
        <TextField label="Kotinuorisotalo" source="mainYouthClub" />
        <BooleanField label="Ylläpitäjä" source="isSuperUser" />
        <EditButton />
      </Datagrid>
  </List>
);

export const YouthWorkerCreate = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
      const addYouthClubsToState = async () => {
          const parsedYouthClubs = await getYouthClubs();
          setYouthClubs(parsedYouthClubs);
      };
      addYouthClubsToState();
  }, []);

  return (
    <Create title="Rekisteröi nuorisotyöntekijä" {...props}>
        <SimpleForm redirect="list">
          <TextInput label="Sähköposti" source="email" type="email" validate={ required() }/>
          <TextInput label="Salasana" source="password" type="password" validate={ required() }/>
          <TextInput label="Etunimi" source="firstName" validate={ required() }/>
          <TextInput label="Sukunimi" source="lastName" validate={ required() }/>
          <SelectInput label="Kotinuorisotalo" source="mainYouthClub" choices={youthClubs} />
          <BooleanInput label="Ylläpitäjä" source="isSuperUser" defaultValue={false} />
        </SimpleForm>
    </Create>
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

  return (
    <Edit title="Muokkaa nuorisotyöntekijää" {...props} undoable={false}>
        <SimpleForm redirect="list">
          <TextInput label="Sähköposti" source="email" type="email" />
          <TextInput label="Salasana" source="password" type="password" />
          <TextInput label="Etunimi" source="firstName" />
          <TextInput label="Sukunimi" source="lastName" />
          <SelectInput label="Kotinuorisotalo" source="mainYouthClub" choices={youthClubs}/>
          <BooleanInput label="Ylläpitäjä" source="isSuperUser" />
        </SimpleForm>
    </Edit>
  );
};
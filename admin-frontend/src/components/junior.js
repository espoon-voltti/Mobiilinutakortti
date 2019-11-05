import React from 'react';
import { 
    List,
    Datagrid,
    TextField,
    SelectField,
    NumberField,
    FunctionField,
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    NumberInput,
    required,
    number,
    choices,
    EditButton,
    Edit,
 } from 'react-admin';

const genderChoices = [
    { id: 'm', name: 'Mies' },
    { id: 'f', name: 'Nainen' },
    { id: 'o', name: 'Muu' }
];

const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);

export const JuniorList = (props) => (
    <List title="Nuoret" {...props}>
        <Datagrid>
            <FunctionField label="Nimi" render={record => `${record.firstName} ${record.lastName}`} />
            <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
            <NumberField label="Ikä" source="age" />
            <TextField label="Puhelinnumero" source="phoneNumber" />
            <TextField label="Postinumero" source="postCode" />
            <TextField label="Kotinuorisotalo" source="homeYouthClub" />
            <TextField label="Huoltajan nimi" source="parentsName" />
            <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
            <EditButton />
        </Datagrid>
    </List>
);
export const JuniorCreate = (props) => (
    <Create title="Rekisteröi nuori" {...props}>
        <SimpleForm redirect="list">
            <TextInput label="Etunimi" source="firstName" validate={ required() }/>
            <TextInput label="Sukunimi" source="lastName" validate={ required() }/>
            <SelectInput label="Sukupuoli" source="gender" choices={ genderChoices } validate={ [required(), choices(['m', 'f', 'o'])] } />
            <NumberInput label="Ikä" source="age" validate={ [required(), number()] }/>
            <TextInput label="Puhelinnumero" source="phoneNumber" validate={ required() }/>
            <TextInput label="Postinumero" source="postCode" validate={ required() }/>
            <TextInput label="Kotinuorisotalo" source="homeYouthClub" validate={ required() }/>
            <TextInput label="Huoltajan nimi" source="parentsName" validate={ required() }/>
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={ required() }/>
        </SimpleForm>
    </Create>
);
export const JuniorEdit = (props) => (
    <Edit title={<JuniorEditTitle />} {...props} undoable={false}>
        <SimpleForm>
            <TextInput label="Etunimi" source="firstName" />
            <TextInput label="Sukunimi" source="lastName" />
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} />
            <NumberInput label="Ikä" source="age" />
            <TextInput label="Puhelinnumero" source="phoneNumber" />
            <TextInput label="Postinumero" source="postCode" />
            <TextInput label="Kotinuorisotalo" source="homeYouthClub" />
            <TextInput label="Huoltajan nimi" source="parentsName" />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
        </SimpleForm>
    </Edit>
);
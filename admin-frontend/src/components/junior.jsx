import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  List,
  Datagrid,
  TextField,
  SelectField,
  DateField,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  DateInput,
  BooleanInput,
  required,
  Button,
  EditButton,
  Edit,
  Filter,
  useNotify,
  Pagination,
  FormDataConsumer,
  useRecordContext,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  getYouthClubs,
  ageValidator,
  genderChoices,
  statusChoices,
} from '../utils';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';
import usePermissions from '../hooks/usePermissions';
import { hiddenFormFields } from '../customizations';

const JuniorEditTitle = () => {
  const record = useRecordContext();
  const name = record ? `${record.firstName} ${record.lastName}` : '';
  return <span>Muokkaa {name}</span>;
};

const SMSwarning = () => (
  <div style={{ paddingTop: '1em', color: 'red' }}>
    Huom! Nuorelle lähetetään kirjautumislinkki tekstiviestitse, kun tallennat
    tiedot.
  </div>
);

export const JuniorList = (props) => {
  const CustomPagination = (props) => (
    <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />
  );

  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  return (
    <List
      title="Nuoret"
      pagination={<CustomPagination />}
      debounce={1000}
      // TODO: filters={<JuniorFilter youthClubs={youthClubs} />}
      bulkActionButtons={false}
      exporter={false}
      {...props}
    >
      <Datagrid>
        <TextField label="Nimi" source="displayName" />
        <SelectField
          label="Sukupuoli"
          source="gender"
          choices={genderChoices}
        />
        <DateField label="Syntymäaika" source="birthday" locales={['fi']} />
        <TextField label="Puhelinnumero" source="phoneNumber" />
        <TextField label="Postinumero" source="postCode" />
        <SelectField
          label="Kotinuorisotila"
          source="homeYouthClub"
          choices={youthClubs}
        />
        <TextField label="Huoltajan nimi" source="parentsName" />
        <TextField
          label="Huoltajan puhelinnumero"
          source="parentsPhoneNumber"
        />
        <DateField label="Päiväys" source="creationDate" locales={['fi']} />
        <SelectField label="Tila" source="status" choices={statusChoices} />
        <PrintQrCodeButton />
        <ResendSMSButton />
        <EditButton className="focusable" />
      </Datagrid>
    </List>
  );
};

const JuniorFilter = ({ youthClubs, ...props }) => (
  <Filter {...props}>
    <TextInput label="Nimi" source="name" autoFocus />
    <TextInput label="Nuoren puhelinnumero" source="phoneNumber" autoFocus />
    <TextInput
      label="Huoltajan puhelinnumero"
      source="parentsPhoneNumber"
      autoFocus
    />
    <SelectInput
      label="Kotinuorisotila"
      source="homeYouthClub"
      choices={youthClubs}
    />
    <SelectInput label="Tila" source="status" choices={statusChoices} />
  </Filter>
);


const ResendSMSButton = () => {
  const record = useRecordContext();
  const notify = useNotify();

  const resendSMS = async (phoneNumber) => {
    const url = api.junior.reset;
    const body = JSON.stringify({
      phoneNumber,
    });
    const options = {
      method: 'POST',
      body,
    };
    await httpClientWithResponse(url, options).then((response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        notify(response.message, 'warning');
      } else {
        notify(response.message);
      }
    });
  };

  return null;

  return record.status === 'accepted' || record.status === 'expired' ? (
    <Button
      size="small"
      variant="outlined"
      onClick={() => resendSMS(record.phoneNumber)}
    >
      Lähetä SMS uudestaan
    </Button>
  ) : (
    <Button disabled>Kotisoitto tekemättä</Button>
  );
};

const PrintQrCodeButton = () => {
  const record = useRecordContext();

  const generateQRAndOpen = async (id, owner) => {
    try {
      const data = await QRCode.toDataURL(id);
      const image = new Image();
      image.src = data;
      image.width = 400;

      const w = window.open('');
      setTimeout(() => (w.document.title = `QR-koodi ${owner}`), 0);
      w.document.write(image.outerHTML);
      w.document.location = '#';
      w.document.close();
    } catch (err) {
      alert('Virhe QR-koodin luonnissa');
    }
  };

  return (
    <Button
      size="small"
      variant="outlined"
      onClick={() =>
        generateQRAndOpen(
          record.id,
          `${record.firstName} ${record.lastName}`,
        )
      }
    >
      <>🔍QR</>
    </Button>
  );
};

const DummyPhoneNumberButton = () => {
  const { setValue } = useFormContext();
  return (
    <Button
      variant="outline"
      size="small"
      onClick={() => {
        httpClientWithResponse(api.junior.dummynumber).then((response) => {
          if (response.message) {
            setValue('phoneNumber', response.message);
          }
        });
      }}
    >
      Käytä korvikepuhelinnumeroa
    </Button>
  );
};

export const JuniorCreate = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  return (
    <Create title="Rekisteröi nuori" {...props}>
      <SimpleForm variant="standard" margin="normal" redirect="list">
        <TextInput label="Etunimi" source="firstName" validate={required()} />
        <TextInput label="Sukunimi" source="lastName" validate={required()} />
        {valueOrNull(
          'nickName',
          <TextInput label="Kutsumanimi" source="nickName" />,
        )}
        <SelectInput
          label="Sukupuoli"
          source="gender"
          choices={genderChoices}
          validate={required()}
        />
        <DateInput
          label="Syntymäaika"
          source="birthday"
          validate={[required(), ageValidator]}
        />
        <TextInput
          label="Puhelinnumero"
          source="phoneNumber"
          validate={required()}
        />
        <DummyPhoneNumberButton />
        {valueOrNull(
          'postCode',
          <TextInput
            label="Postinumero"
            source="postCode"
            validate={required()}
          />,
        )}
        {valueOrNull(
          'school',
          <TextInput label="Koulu" source="school" validate={required()} />,
        )}
        {valueOrNull(
          'class',
          <TextInput label="Luokka" source="class" validate={required()} />,
        )}
        <TextInput
          label="Huoltajan nimi"
          source="parentsName"
          validate={required()}
        />
        <TextInput
          label="Huoltajan puhelinnumero"
          source="parentsPhoneNumber"
          validate={required()}
        />
        <SelectInput
          label="Kotinuorisotila"
          source="homeYouthClub"
          choices={youthClubs}
          validate={required()}
        />
        <SelectInput
          label="Kommunikaatiokieli"
          source="communicationsLanguage"
          choices={languages}
          validate={required()}
        />
        <BooleanInput
          label="Kuvauslupa"
          source="photoPermission"
          defaultValue={false}
        />
        <SelectInput
          label="Tila"
          source="status"
          choices={statusChoices}
          validate={required()}
        />
        <FormDataConsumer>
          {({ formData }) => formData.status === 'accepted' && <SMSwarning />}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};

export const JuniorEdit = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();

    const targetNode = document;
    const config = { attributes: true, childList: false, subtree: true };

    const checkTitles = () => {
      const title = document.getElementById('alert-dialog-title');
      if (title) {
        title.getElementsByTagName('h2')[0].innerHTML = 'Poista Junior';
      }
    };
    const observer = new MutationObserver(checkTitles);
    observer.observe(targetNode, config);

    return () => {
      observer.disconnect();
    };
  }, []);
  return (
    <Edit title={<JuniorEditTitle />} {...props} undoable={false}>
      <SimpleForm variant="standard" margin="normal">
        <TextInput label="Etunimi" source="firstName" validate={required()} />
        <TextInput label="Sukunimi" source="lastName" validate={required()} />
        {valueOrNull(
          'nickName',
          <TextInput label="Kutsumanimi" source="nickName" />,
        )}
        <SelectInput
          label="Sukupuoli"
          source="gender"
          choices={genderChoices}
          validate={required()}
        />
        <DateInput
          label="Syntymäaika"
          source="birthday"
          validate={[required(), ageValidator]}
        />
        <TextInput
          label="Puhelinnumero"
          source="phoneNumber"
          validate={required()}
        />
        <DummyPhoneNumberButton />
        {valueOrNull(
          'postCode',
          <TextInput
            label="Postinumero"
            source="postCode"
            validate={required()}
          />,
        )}
        {valueOrNull(
          'school',
          <TextInput label="Koulu" source="school" validate={required()} />,
        )}
        {valueOrNull(
          'class',
          <TextInput label="Luokka" source="class" validate={required()} />,
        )}
        <TextInput
          label="Huoltajan nimi"
          source="parentsName"
          validate={required()}
        />
        <TextInput
          label="Huoltajan puhelinnumero"
          source="parentsPhoneNumber"
          validate={required()}
        />
        <SelectInput
          label="Kotinuorisotila"
          source="homeYouthClub"
          choices={youthClubs}
          validate={required()}
        />
        <SelectInput
          label="Kommunikaatiokieli"
          source="communicationsLanguage"
          choices={languages}
          validate={required()}
        />
        <BooleanInput label="Kuvauslupa" source="photoPermission" className="toggleField" />
        <StatusInput />
        <SMSwarningInput />
      </SimpleForm>
    </Edit>
  );
};

const StatusInput = () => {
  const { isSuperAdmin } = usePermissions();
  const record = useRecordContext();
  const disabled = record.status === 'expired' && !isSuperAdmin;
  return (
    <SelectInput
      disabled={disabled}
      label="Tila"
      source="status"
      choices={statusChoices}
      validate={required()}
    />
  );
};

const SMSwarningInput = () => {
  const record = useRecordContext();
  const status = useWatch({ name: 'status' });

  if (status === 'accepted' && (record.status === 'pending' || record.status === 'failedCall')) {
    return <SMSwarning />;
  }
  return null;
};

const languages = [
  { id: 'fi', name: 'suomi' },
  { id: 'sv', name: 'ruotsi' },
  { id: 'en', name: 'englanti' },
];

function valueOrNull(name, visibleValue) {
  return hiddenFormFields.includes(name) ? null : visibleValue;
}

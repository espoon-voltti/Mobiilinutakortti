import React from 'react'
import { Translations } from '../types'

export const translations: Translations = {
  addToHomescreen: <>Click the <i/> icon and choose ”Add to home screen” to add the app</>,
  login: {
    title: 'Nuta card',
    label: 'Your phone number',
    placeholder: 'Ex: 05051190912',
    submit: 'Send a new login link',
    errorMessage: 'Check that the the phone number is valid',
    authMessages: {
      authFail: 'Login failed. Enter your phone number to get a new login link',
      linkRequestSuccess: 'A new link was sent to the number you entered',
      linkRequestFail: 'Link sending failed, please try again',
    }
  },
  logout: {
    title: 'Nuta card application',
    heading: 'Thank you!',
    message: 'You have now logged out. Thanks for using the service!'
  },
  parentRedirect: {
    title: 'Applying for a Nuta card',
    ingress: 'The Nuta card is a free membership card for Vantaa youth clubs that works in mobile devices. Your child uses it to sign in to the youth club.',
    description: (
      <p>
        With this form you can apply for a membeship card of the youth services of the city of Vantaa member for your
        child or teenager.
        The card is renewed using the same form for every activity term.
        Log in with online banking codes, mobile certificate, or identity card and fill the requested information.
        <br/><br/>
        When the application has been received, we'll call you and send the child a personal login link to the service
        via SMS.
      </p>
    ),
    submit: 'Fill the application',
    privacyPolicy: {
      title: 'Privacy policy',
      href: 'https://www.vantaa.fi/hallinto_ja_talous/hallinto/henkilotietojen_kasittely/informointiasiakirjat/nuorisopalveluiden_informointiasiakirja'
    }
  },
  parentRegistration: {
    logout: 'Log out',
    title: 'Nuta card application',
    form: {
      juniorHeading: 'Child\'s information',
      juniorFirstName: 'First name',
      juniorLastName: 'Last name',
      juniorNickName: 'Nickname',
      juniorBirthday: 'Date of birth',
      juniorBirthdayPlaceholder: 'dd.mm.yyyy',
      juniorPhoneNumber: 'Phone number',
      postCode: 'Postal code',
      school: 'Name of school',
      class: 'Class',
      juniorGender: 'Gender',
      juniorGenderOptions: {
        f: 'Girl',
        m: 'Boy',
        o: 'Other',
        '-': 'I don\'t want to specify',
      },
      photoPermission: 'Photographing permit',
      photoPermissionDescription: 'We take photographs and videos of our activities from time to time for public communications. Pictures can be used in the publications of the youth service (e.g. in social media, web pages and brochures). \nThe picture of my child can be used in public communications of their home city.',
      photoPermissionOptions: {
        y: 'Yes',
        n: 'No',
      },

      parentHeading: 'Guardian\'s information',
      parentFirstName: 'First name',
      parentLastName: 'Last name',
      parentPhoneNumber: 'Phone number',

      youthClubHeading: 'Home youth club',
      youthClubDefault: 'Choose youth club',
      youthClubDescription: 'Choose the youth club your child usually visits.',

      communicationsLanguage: 'Communications language',
      communicationsLanguageDefault: 'Choose language',
      communicationsLanguageDescription: 'Language which the system uses for messages sent to the child (e.g. SMS messages)',

      termsOfUse: (
        <>
          I agree to&nbsp;<a target='_blank' rel="noopener noreferrer"
          href='https://www.vantaa.fi/instancedata/prime_product_julkaisu/vantaa/embeds/vantaawwwstructure/150593_Mobiilinutakortin_kayttoehdot.pdf'>the
          terms of use</a>
        </>
      ),
      submit: 'Send application',
      privacyPolicy: {
        title: 'Read how we handle your personal data.',
        href: 'https://www.vantaa.fi/hallinto_ja_talous/hallinto/henkilotietojen_kasittely/informointiasiakirjat/nuorisopalveluiden_informointiasiakirja',
      }
    },
    errors: {
      required: 'Fill the information',
      birthdayFormat: 'Enter the date of birth in format dd.mm.yyyy',
      phoneNumberFormat: 'Check that the phone number you entered is correct',
      postCodeFormat: 'Check that the postal code you entered is correct',
      selectYouthClub: 'Choose a youth club from the menu',
      selectLanguage: 'Choose a language from the menu',
      acceptTermsOfUse: 'Accept the terms to continue',
    },
    confirmation: {
      heading: 'Thank you for the application',
      message: (logoutLink, startOverLink) => (
        <p>When the child's membership card application has been processed, he or she will be sent a personal log in
          link via SMS. You can now {logoutLink('log out')} or {startOverLink('start over')} to apply for a card for
          another child.
        </p>
      )
    },
    error: {
      message: 'Something went wrong. If the error recurs often, contact your nearest youth club or the Nuta card contact person, tel. +358 400 662739 (Mon-Fri 8-16).',
      back: 'Back',
    }
  },
  qrPage: {
    login: 'Login',
    instruction: 'Show QR code to a reader when entering the youth club.',
  },
  languages: {
    fi: 'Finnish',
    sv: 'Swedish',
    en: 'English'
  }
}

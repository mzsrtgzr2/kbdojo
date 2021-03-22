import React from 'react';
import { render } from '@testing-library/react';
import { FirestoreProvider } from 'react-firestore';
import dbHelper from '../helpers/db';

let dbInstance: any;

beforeAll(() => {
    dbInstance = dbHelper.init();
});
test('renders learn react link', () => {
    // const { getByText } = render(<FirestoreProvider firebase={dbInstance}><FirebaseDemo /></FirestoreProvider>);
    // const linkElement = getByText(/Firebase insert/i);
    // expect(linkElement).toBeInTheDocument();
});
afterAll(() => {
    dbHelper.close();
});

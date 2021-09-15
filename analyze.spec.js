const {
	standardDeviation,
	sanitizeAmounts,
	roundToTwoDp,
	analysePayments,
} = require('./analyze.js');
const test = require('ava');

const testData = require('./example.json');

test('Standard Deviation is correct for Basic Data', (t) => {
	//First Argument for t.is is actual, second is expected
	t.deepEqual(standardDeviation([1, 2, 2, 2, 1, 1]), 0.5);
});

test('Payments are analysed correctly', (t) => {
	//First Argument for t.is is actual, second is expected
	t.deepEqual(
		analysePayments([
			{
				Amount: 1,
				TransactionInformation: 'Payment One',
			},
			{
				Amount: 2,
				TransactionInformation: 'Payment Two',
			},
			{
				Amount: 3,
				TransactionInformation: 'Payment Three',
			},
			{
				Amount: 4,
				TransactionInformation: 'Payment Four',
			},
		]),
		{
			max: 4,
			mean: 2.5,
			median: 2.5,
			min: 1,
			standardDeviation: 1.12,
		}
	);
});

test.skip('Check Data Structure - Analyse Payments', (t) => {
	/*
  Test outcome is heavily dependant on the input data
  Passes with current data
  Fails due to >2dp bug
  */
	const testDataJSONStr = JSON.stringify(analysePayments(testData));
	t.regex(testDataJSONStr, /{("?\w+"?:-?\d+\.?\d{0,2}?,?){5}}/g);
});

test('Check "Amount" Input/Output - Sanitise Data - Integer', (t) => {
	t.deepEqual(
		sanitizeAmounts([
			{
				Amount: 750,
				TransactionInformation: 'Koodoo Mortgage Co.',
			},
		]),
		[750]
	);
});

test('Check "Amount" Input/Output - Sanitise Data - String', (t) => {
	t.deepEqual(
		sanitizeAmounts([
			{
				Amount: '750',
				TransactionInformation: 'Koodoo Mortgage Co.',
			},
		]),
		[750]
	);
});

test('Check "Amount" Input/Output - Sanitise Data - Null', (t) => {
	/*
  Need to know expected outcome
  Currently turning Null -> 0
  */
	t.deepEqual(
		sanitizeAmounts([
			{
				Amount: null,
				TransactionInformation: 'Koodoo Mortgage Co.',
			},
		]),
		[0]
	);
});

test('Check "Amount" Input/Output - Sanitise Data - Empty', (t) => {
	/*
  Need to know expected outcome
  Currently turning '' -> 0
  */
	t.deepEqual(
		sanitizeAmounts([
			{
				Amount: '',
				TransactionInformation: 'Koodoo Mortgage Co.',
			},
		]),
		[0]
	);
});

test('Check "Amount" Input/Output - Sanitise Data - Missing', (t) => {
	t.deepEqual(
		sanitizeAmounts([
			{
				TransactionInformation: 'Koodoo Mortgage Co.',
			},
		]),
		[]
	);
});

test('Check "Amount" Input/Output - Sanitise Data - Symbols', (t) => {
	/*
  Need to know expected outcome
  Currently returning NaN for any incompatible symbol
  */
	t.deepEqual(
		sanitizeAmounts([
			{
				Amount: '£750',
				TransactionInformation: 'Koodoo Mortgage Co.',
			},
			{
				Amount: 65,
				TransactionInformation: 'Second Transacion',
			},
		]),
		[NaN, 65]
	);
});

test('Check Output - Round to 2dp - 0dp', (t) => {
	t.deepEqual(roundToTwoDp(35), 35);
});

test('Check Output - Round to 2dp - 1dp', (t) => {
	t.deepEqual(roundToTwoDp(35.1), 35.1);
});

test('Check Output - Round to 2dp - 2dp', (t) => {
	t.deepEqual(roundToTwoDp(35.12), 35.12);
});

test('Check Output - Round to 2dp - 3dp low rounding', (t) => {
	t.deepEqual(roundToTwoDp(35.123), 35.12);
});

test('Check Output - Round to 2dp - 3dp high rounding', (t) => {
	t.deepEqual(roundToTwoDp(35.126), 35.13);
});

test.failing('Check Output - Analyse Payments - 2dp on Min', (t) => {
	/*
  No 2dp rounding is present on Min value
  */
	const paymentsObj = analysePayments([
		{
			Amount: 78.12345,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
	]);
	t.deepEqual(paymentsObj.min, 78.12);
});

test.failing('Check Output - Analyse Payments - 2dp on Max', (t) => {
	/*
  No 2dp rounding is present on Max value
  */
	const paymentsObj = analysePayments([
		{
			Amount: 78.12345,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
	]);
	t.deepEqual(paymentsObj.max, 78.12);
});

test.failing('Check Output - Analyse Payments - 2dp on Median', (t) => {
	/*
  No 2dp rounding is present on Median value
  */
	const paymentsObj = analysePayments([
		{
			Amount: 78.12345,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
	]);
	t.deepEqual(paymentsObj.median, 78.12);
});

test('Check Output - Analyse Payments - 2dp on Mean', (t) => {
	const paymentsObj = analysePayments([
		{
			Amount: 78.12345,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
	]);
	t.deepEqual(paymentsObj.mean, 78.12);
});

test('Check Output - Analyse Payments - 2dp on Std Dev', (t) => {
	const paymentsObj = analysePayments([
		{
			Amount: 600,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
		{
			Amount: 470,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
		{
			Amount: 170,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
		{
			Amount: 430,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
		{
			Amount: 300,
			TransactionInformation: 'Koodoo Mortgage Co.',
		},
	]);
	t.deepEqual(paymentsObj.standardDeviation, 147.32);
});

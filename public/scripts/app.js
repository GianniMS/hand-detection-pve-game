import knn from 'knear'
const k = 3
const machine = new knn.kNear(k)

const newData = [
    { data: [18, 9.2, 8.1, 2], label: 'cat' },
    { data: [20.1, 17, 15.5, 5], label: 'dog' },
    { data: [17, 9.1, 9, 1.95], label: 'cat' },
    { data: [23.5, 20, 20, 6.2], label: 'dog' },
    { data: [16, 9.0, 10, 2.1], label: 'cat' },
    { data: [21, 16.7, 16, 3.3], label: 'dog' }
];

// Loop through the new data and train the machine
newData.forEach(({ data, label }) => {
    machine.learn(data, label);
});

let prediction = machine.classify([12,18,17])
console.log(`I think this is a ${prediction}`)

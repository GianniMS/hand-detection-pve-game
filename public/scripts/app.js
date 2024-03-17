// import knn from 'knear';
// import fs from 'fs';
//
// const k = 3;
// const machine = new knn.kNear(k);
//
// // Read the JSON file synchronously
// const jsonData = fs.readFileSync('training_data.json');
// const newData = JSON.parse(jsonData);
//
// // Loop through the new data and train the machine
// newData.forEach(({ landmarks, action }) => {
//     machine.learn(landmarks, action);
// });
//
// let prediction = machine.classify([12, 18, 17]);
// console.log(`I think this is a ${prediction}`);
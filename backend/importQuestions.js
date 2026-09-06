const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');
const fs = require('fs');
const path = require('path');

dotenv.config();

const importData = async () => {
  try {
    const atlasURI = 'mongodb+srv://alamraza2327_db_user:FeoQpEBDksz33GAv@cluster0.lp5tyx9.mongodb.net/ncc_portal?appName=Cluster0';
    await mongoose.connect(atlasURI);
    console.log('Connected to DB for importing questions');

    // Read the JSON file
    const dataPath = path.join(__dirname, 'data', 'originalQuestions.json');
    const rawData = fs.readFileSync(dataPath);
    const jsonData = JSON.parse(rawData);

    // Map letters to index (0-3)
    const letterToIndex = {
      'A': 0,
      'B': 1,
      'C': 2,
      'D': 3
    };

    // Transform the data to match the Question schema
    const formattedQuestions = jsonData.questions.map(q => {
      return {
        questionText: q.question,
        options: [
          q.options.A,
          q.options.B,
          q.options.C,
          q.options.D
        ],
        correctAnswer: letterToIndex[q.correct_answer]
      };
    });

    // Delete existing questions
    await Question.deleteMany();
    console.log('Deleted old dummy questions.');

    // Insert new questions
    await Question.insertMany(formattedQuestions);
    console.log(`Successfully imported ${formattedQuestions.length} new questions!`);

    process.exit();
  } catch (error) {
    console.error('Error importing questions:', error);
    process.exit(1);
  }
};

importData();

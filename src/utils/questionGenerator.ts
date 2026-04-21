import { Difficulty, Question, Operation } from './gameTypes';

export class QuestionGenerator {
  private lastQuestion: Question | null = null;
  private problemCount: number = 0;

  constructor(private difficulty: Difficulty) {}

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateAddition(): Question {
    const max = this.difficulty === 'easy' ? 20 : 50;
    const num1 = this.getRandomInt(1, max);
    const num2 = this.getRandomInt(1, max);
    return {
      num1,
      num2,
      operation: '+',
      answer: num1 + num2,
      displayText: `${num1} + ${num2}`
    };
  }

  private generateSubtraction(): Question {
    const max = this.difficulty === 'easy' ? 20 : 50;
    const num1 = this.getRandomInt(10, max);
    const num2 = this.getRandomInt(1, num1);
    return {
      num1,
      num2,
      operation: '-',
      answer: num1 - num2,
      displayText: `${num1} - ${num2}`
    };
  }

  private generateMultiplication(): Question {
    const max = this.difficulty === 'medium' ? 12 : 15;
    const num1 = this.getRandomInt(2, max);
    const num2 = this.getRandomInt(2, max);
    return {
      num1,
      num2,
      operation: '×',
      answer: num1 * num2,
      displayText: `${num1} × ${num2}`
    };
  }

  private generateDivision(): Question {
    const max = 12;
    const num2 = this.getRandomInt(2, max);
    const quotient = this.getRandomInt(2, max);
    const num1 = num2 * quotient;
    return {
      num1,
      num2,
      operation: '÷',
      answer: quotient,
      displayText: `${num1} ÷ ${num2}`
    };
  }

  public generateQuestion(): Question {
    let question: Question;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      if (this.difficulty === 'easy') {
        question =
        Math.random() < 0.5 ?
        this.generateAddition() :
        this.generateSubtraction();
      } else if (this.difficulty === 'medium') {
        const rand = Math.random();
        if (rand < 0.5) {
          question = this.generateMultiplication();
        } else if (rand < 0.75) {
          question = this.generateAddition();
        } else {
          question = this.generateSubtraction();
        }
      } else {
        // Hard mode - all operations
        const rand = Math.random();
        if (rand < 0.3) {
          question = this.generateMultiplication();
        } else if (rand < 0.5) {
          question = this.generateDivision();
        } else if (rand < 0.75) {
          question = this.generateAddition();
        } else {
          question = this.generateSubtraction();
        }
      }
      attempts++;
    } while (
    this.lastQuestion &&
    question.displayText === this.lastQuestion.displayText &&
    attempts < maxAttempts);


    this.lastQuestion = question;
    this.problemCount++;
    return question;
  }

  public getAdjustedTime(baseTime: number): number {
    // Gradually decrease time as problems increase
    const reduction = Math.floor(this.problemCount / 10) * 0.5;
    return Math.max(2, baseTime - reduction);
  }

  public reset(): void {
    this.lastQuestion = null;
    this.problemCount = 0;
  }
}
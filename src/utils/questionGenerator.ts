import { Difficulty, Question } from './gameTypes';

export class QuestionGenerator {
  private lastQuestion: Question | null = null;
  private problemCount: number = 0;

  constructor(private difficulty: Difficulty) {}

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Ramps from 0 up to 1 over the first ~24 problems, so number ranges and
   * time pressure grow smoothly as the run goes on instead of staying flat.
   */
  private get progress(): number {
    return Math.min(1, this.problemCount / 24);
  }

  private generateAddition(): Question {
    const cap = this.difficulty === 'easy' ? 20 : 50;
    const max = Math.round(10 + (cap - 10) * this.progress);
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
    const cap = this.difficulty === 'easy' ? 20 : 50;
    const max = Math.round(12 + (cap - 12) * this.progress);
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
    const cap = this.difficulty === 'medium' ? 12 : 15;
    const max = Math.round(9 + (cap - 9) * this.progress);
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
    const cap = 12;
    const max = Math.round(6 + (cap - 6) * this.progress);
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
          Math.random() < 0.5 ? this.generateAddition() : this.generateSubtraction();
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
      attempts < maxAttempts
    );

    this.lastQuestion = question;
    this.problemCount++;
    return question;
  }

  /**
   * Time allowed for the current question. Shrinks gradually as the run goes
   * on, but never below half the base time so it always stays answerable.
   */
  public getAdjustedTime(baseTime: number): number {
    const reduction = Math.floor(this.problemCount / 8) * 0.5;
    return Math.max(baseTime * 0.5, baseTime - reduction);
  }

  public reset(): void {
    this.lastQuestion = null;
    this.problemCount = 0;
  }
}

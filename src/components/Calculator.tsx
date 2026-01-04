import { useState, useCallback, useEffect } from 'react';
import { Delete } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    setDisplay(prev => prev.length === 1 ? '0' : prev.slice(0, -1));
  }, [waitingForOperand]);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev === '0' ? digit : prev + digit);
    }
  }, [waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  }, [display, waitingForOperand]);

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operator) {
      const currentValue = parseFloat(previousValue);
      let result: number;

      switch (operator) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            setDisplay('Error');
            setPreviousValue(null);
            setOperator(null);
            setWaitingForOperand(true);
            return;
          }
          result = currentValue / inputValue;
          break;
        default:
          result = inputValue;
      }

      const resultString = Number.isInteger(result) 
        ? result.toString() 
        : parseFloat(result.toFixed(10)).toString();
      
      setDisplay(resultString);
      setPreviousValue(resultString);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, previousValue]);

  const calculate = useCallback(() => {
    if (!operator || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let result: number;

    switch (operator) {
      case '+':
        result = currentValue + inputValue;
        break;
      case '-':
        result = currentValue - inputValue;
        break;
      case '×':
        result = currentValue * inputValue;
        break;
      case '÷':
        if (inputValue === 0) {
          setDisplay('Error');
          setPreviousValue(null);
          setOperator(null);
          setWaitingForOperand(true);
          return;
        }
        result = currentValue / inputValue;
        break;
      default:
        return;
    }

    const resultString = Number.isInteger(result) 
      ? result.toString() 
      : parseFloat(result.toFixed(10)).toString();

    setDisplay(resultString);
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, operator, previousValue]);

  const toggleSign = useCallback(() => {
    setDisplay(prev => {
      const value = parseFloat(prev);
      return (value * -1).toString();
    });
  }, []);

  const percentage = useCallback(() => {
    setDisplay(prev => {
      const value = parseFloat(prev);
      return (value / 100).toString();
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
      } else if (e.key === 'Escape') {
        clearAll();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === '%') {
        percentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, calculate, clearAll, backspace, percentage]);

  const Button = ({ 
    children, 
    onClick, 
    variant = 'number',
    span = 1 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    variant?: 'number' | 'operator' | 'function' | 'equals';
    span?: number;
  }) => (
    <button
      onClick={onClick}
      className={`
        calc-button
        ${variant === 'number' ? 'calc-button-number' : ''}
        ${variant === 'operator' ? 'calc-button-operator' : ''}
        ${variant === 'function' ? 'calc-button-function' : ''}
        ${variant === 'equals' ? 'calc-button-equals' : ''}
        ${span === 2 ? 'col-span-2' : ''}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="calc-container">
      <div className="calc-body">
        {/* Display */}
        <div className="calc-display">
          <div className="calc-display-expression">
            {previousValue && operator && (
              <span>{previousValue} {operator}</span>
            )}
          </div>
          <div className="calc-display-value">
            {display}
          </div>
        </div>

        {/* Button Grid */}
        <div className="calc-grid">
          <Button onClick={clearAll} variant="function">AC</Button>
          <Button onClick={toggleSign} variant="function">±</Button>
          <Button onClick={percentage} variant="function">%</Button>
          <Button onClick={() => performOperation('÷')} variant="operator">÷</Button>

          <Button onClick={() => inputDigit('7')}>7</Button>
          <Button onClick={() => inputDigit('8')}>8</Button>
          <Button onClick={() => inputDigit('9')}>9</Button>
          <Button onClick={() => performOperation('×')} variant="operator">×</Button>

          <Button onClick={() => inputDigit('4')}>4</Button>
          <Button onClick={() => inputDigit('5')}>5</Button>
          <Button onClick={() => inputDigit('6')}>6</Button>
          <Button onClick={() => performOperation('-')} variant="operator">−</Button>

          <Button onClick={() => inputDigit('1')}>1</Button>
          <Button onClick={() => inputDigit('2')}>2</Button>
          <Button onClick={() => inputDigit('3')}>3</Button>
          <Button onClick={() => performOperation('+')} variant="operator">+</Button>

          <Button onClick={() => inputDigit('0')} span={1}>0</Button>
          <Button onClick={backspace} variant="function">
            <Delete size={20} />
          </Button>
          <Button onClick={inputDecimal}>.</Button>
          <Button onClick={calculate} variant="equals">=</Button>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="calc-hint">
        Keyboard supported: 0-9, operators, Enter, Escape, Backspace
      </p>
    </div>
  );
};

export default Calculator;

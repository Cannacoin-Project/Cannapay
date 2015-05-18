//TODO: Make some cool function using fibonnaci to build a trade latter :D
var startPoint = 0.00000500;
var endPoint = 0.00000500
var i;
var fib = []; //Initialize array!
var fibResults = [];
fib[0] = endPoint-startPoint/2;
fib[1] = endPoint-startPoint;
for(i=2; i<=10; i++)
{
    // Next fibonacci number = previous + one before previous
    // Translated to JavaScript:
    fib[i] = fib[i-2] + fib[i-1];
    fibResults.push(fib[i]);
}

alert('Fibonacci results: ' + fibResults.toFixed(8));
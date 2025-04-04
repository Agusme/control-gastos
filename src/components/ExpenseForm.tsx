import { categories } from "../data/categories";
import DatePicker from 'react-date-picker';
import 'react-calendar/dist/Calendar.css';
import 'react-date-picker/dist/DatePicker.css';
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DraftExpense } from "../types";
import { Value } from "react-calendar/src/shared/types.js";
import ErrorMessege from "./ErrorMessege";
import { UseBudget } from "../hooks/useBudget";

export default function ExpenseForm() {

    const [expense, setExpense] = useState<DraftExpense>({
        amount: 0,
        expenseName: '',
        category: '',
        date: new Date()
    })

    const [error, setError] = useState('')
const[previousAmount, setPreviosAmount]= useState(0)
    const { dispatch, state, remainingBudget} = UseBudget()
  
    useEffect(() => {
        if (state.editingId) {
            const editingExpense = state.expenses.filter(currentExpense => currentExpense.id === state.editingId)[0]
            setExpense(editingExpense)
            setPreviosAmount(editingExpense.amount)
        }

    }, [state.editingId])

    const handleChangeDate = (value: Value) => {
        setExpense({
            ...expense,
            date: value
        })
    }
    const handleChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>) => {

        const { name, value } = e.target
        const isAmountField = ['amount'].includes(name) /*  esto controla que estemos escribiendo en el campo de amount */
        setExpense({
            ...expense,
            /* Si el campo es de tipo amount al value lo convertimos en numero sino conservamos el value */
            [name]: isAmountField ? +value : value
        })
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        /* validaciones */
        /* si el usario no lleno uno de ellos */
        if (Object.values(expense).includes('')) {
            setError('Todos los campos son obligatorios')
            return
        }
        /* validar que no me pase del presupuesto */
        if((expense.amount - previousAmount) > remainingBudget){
            setError('Ese gasto se sale del presupuesto')
            return
        }
        //agregar un nuevo gasto o actulizar
        if(state.editingId){
            dispatch({type:'update-expense', payload: {expense: {id: state.editingId, ...expense}}})
        }else{
            dispatch({ type: 'add-expense', payload: { expense } })
        }

        //reiniciar el form
        setExpense({
            amount: 0,
            expenseName: '',
            category: '',
            date: new Date()
        })
        setPreviosAmount(0)
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <legend className="uppercase text-center text-2xl font-bold border-b-4  border-blue-500 py-2">
            {state.editingId? 'Guardar Cambios': 'Nuevo Gasto'}
            </legend>
            {error && <ErrorMessege>{error} </ErrorMessege>}
            <div className="flex flex-col gap-2">
                <label htmlFor="expenseName" className="text-xl">Nombre Gasto:</label>
                <input type="text" id="expenseName" placeholder="Añade el Nombre del gasto" className="bg-slate-100 p-2" name="expenseName" value={expense.expenseName} onChange={handleChange} />
            </div>
            <div className=" flex flex-col gap-2">
                <label htmlFor="amount" className="text-xl">Cantidad:</label>
                <input type="number" id="amount" placeholder="Añade la cantidad del gasto: ej. 300" className="bg-slate-100 p-2" name="amount" value={expense.amount} onChange={handleChange} />
            </div>
            <div className=" flex flex-col gap-2">
                <label htmlFor="category" className="text-xl">Categória:</label>
                <select name="category" id="category" className="bg-slate-100 p-2" value={expense.category} onChange={handleChange}>
                    <option value="">-- Seleccione --</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className=" flex flex-col gap-2">
                <label htmlFor="amount" className="text-xl">Fecha Gastos:</label>

                <DatePicker
                    className='bg-slate-100 p-2 border-0'
                    value={expense.date}
                    onChange={handleChangeDate}
                />
            </div>
            <input type="submit" className="cursor-pointer bg-blue-600 w-full text-white uppercase p-2 font-bold rounded-lg " value={state.editingId? 'Guardar Cambios': 'Registrar Gasto'} />
        </form >
    )
}

Component

function Bookmark() {
  [editMode, setEditMode] = useState(false)
  [inputText, setInputText] = useState(props.text)

  return (
<button onClick={()=>setEditMode(previous => !previous)} />
    ...

    {!editMode ? <p>{propsasdfasdf}</p>

   :
   form
      <input onChange={(e)=> setInputText(e.currentTarget.value)} value={inputText}} />
      <button onClick={()=> setEditMode(false), update}/>
    }
  )

}



mapping ->
<Bookmark text={Bookmark.text}/>
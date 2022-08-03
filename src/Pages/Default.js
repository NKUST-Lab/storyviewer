import { Link } from 'react-router-dom'
import { useState } from 'react';

function Default() {
    const [book_id, setbook_id] = useState(152)
    return (
        <>
          <div>current page number {book_id}</div>
          <input type="text" onChange={e => setbook_id(e.target.value)} value={book_id}/>
          <Link to={`/${book_id}`} >Click to storyviwer</Link>
        </>
    );
}

export default Default;
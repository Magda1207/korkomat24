import axios from 'axios'
import { useEffect, useState } from 'react'
import api from '../api/apiInterceptors.js';

export function useFetch(url, params, deps = []) {

    const [data, setData] = useState([])
    const [error, setError] = useState([])
  
    useEffect(() => {
      (async () => {
        setError(false)
        try {
          const result = await api.get(url, {params: params})
          setData(result.data)
        }
        catch (error) {
          setError(true)
        }
        //Loading
        //Data fetching libraries?
      })()
    }
      , deps)
  
    return [data, error]
  }


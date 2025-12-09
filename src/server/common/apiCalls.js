import axios from 'axios'
import { useEffect, useState } from 'react'

export function useFetch(url, params, deps = []) {

    const [data, setData] = useState([])
    const [error, setError] = useState([])
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      (async () => {
        setError(false)
        setLoading(true)
        if(deps)
        try {
          const result = await axios.get(url, {params: params})
          setData(result.data)
        }
        catch (error) {
          setError(true)
        }
        finally {
          setLoading(false);
        }

        //Loading
        //Data fetching libraries?
      })()
    }
      , deps)


      return [data, loading]
  }


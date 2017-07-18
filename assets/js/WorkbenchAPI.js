<<<<<<< HEAD
// Wraps all API calls. Useful both to centralize and abstract these calls,
=======
// Wraps all API calls. Useful both to centralize and abstract these calls, 
>>>>>>> master
// also for dependency injection for testing

import { csrfToken } from './utils'

// All API calls which fetch data return a promise which returns JSON
<<<<<<< HEAD
export default class WorkbenchAPI {
=======
class WorkbenchAPI {
>>>>>>> master

  getWfModuleVersions(wf_module_id) {
    // NB need parens around the contents of the return, or this will fail miserably (return undefined)
    return (
        fetch('/api/wfmodules/' + wf_module_id + '/dataversions', {credentials: 'include'})
        .then(response => response.json())
    )
  }

  setWfModuleVersion(wf_module_id, version) {
    return (
      fetch('/api/wfmodules/' + wf_module_id + '/dataversions', {
        method: 'patch',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          selected: version
        })
      }))
  }
<<<<<<< HEAD

  setWfName(wfId, newName) {
    return (
      fetch('/api/workflows/' + wfId, {
        method: 'post',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          'newName': newName
        })
      })
    )
  }
}
=======
}

// Singleton API object for global use
const api = new WorkbenchAPI();
export default () => { return api; }
>>>>>>> master

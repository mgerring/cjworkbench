import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Form, FormGroup, Label, Input } from 'reactstrap'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { csrfToken } from './utils'
import dateFormat from 'dateformat'
import PropTypes from 'prop-types'


export default class DataVersionSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      modalOpen: false,
      dropdownOpen: false,
      versions: {versions: [], selected: ''},
      originalSelected: ''
    };
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);    
    this.setSelected = this.setSelected.bind(this);
    this.changeVersions = this.changeVersions.bind(this);    
  }

  toggleModal() {
    this.setState(Object.assign({}, this.state, { modalOpen: !this.state.modalOpen }));
  }

  toggleDropdown() {
    this.setState(Object.assign({}, this.state, { dropdownOpen: !this.state.dropdownOpen }));
  }

  componentDidMount() {
    var wf_module_id =  this.props.wf_module_id;

    console.log('WF module ID: ' + wf_module_id);

    fetch('/api/wfmodules/' + wf_module_id + '/dataversions', {credentials: 'include'})
      .then(response => response.json())
      .then(json => {
        console.log('Versions state returned: ' + JSON.stringify(json));
        this.setState(
          Object.assign({}, this.state, {versions: json, originalSelected: json.selected})
        );
      })
  }

  setSelected(date) {
    this.setState(
      Object.assign(
        {}, 
        this.state, 
        {versions: {'versions': this.state.versions.versions, 'selected': date}}
      )
    );
  }

  changeVersions() {
    var wf_module_id =  this.props.wf_module_id;

    if (this.state.versions.selected !== this.state.originalSelected) {
      fetch('/api/wfmodules/' + wf_module_id + '/dataversions', {
        method: 'patch',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          selected: this.state.versions.selected
        })
      }).then(() => {
        this.setState(
          Object.assign({}, this.state, {originalSelected: this.state.versions.selected})
        )
      })
    }

    this.toggleModal();
  }

  render() {    
    // TODO: Assign conditional render if module is open/closed: see WfModule 115
    // TODO: Refactor calculated classNames outside of Return statement

    return (
      <div className='version-item'>
        <div className='info-blue mb-2' onClick={this.toggleModal}>Version X of Y (click to change)</div>
        <div className=''>{dateFormat(this.state.originalSelected, "mmmm d yyyy - HH:MM TT Z")}</div>        
        <Modal isOpen={this.state.modalOpen} toggle={this.toggleModal} className={this.props.className}>
          <ModalHeader toggle={this.toggleModal} >
            <div className='dialog-box-name'>Dataset Versions</div>
          </ModalHeader>
          <ModalBody>
            <div className='scolling-list'>
              {this.state.versions.versions.map( date => {
                return (
                  <div 
                    key={date} 
                    className={(date == this.state.versions.selected) ? 'version-active' : 'version-disabled'}
                    onClick={() => this.setSelected(date)}
                  >
                    <div className={(date == this.state.versions.selected) ? 'line-item-active' : 'line-item-disabled'}>
                      Date: {dateFormat(date, "mmmm d yyyy - HH:MM TT Z")}
                    </div>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button className='button-blue' onClick={this.toggleModal}>Cancel</Button>    
            <Button className='button-blue' onClick={this.changeVersions}>OK</Button>                    
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

DataVersionSelect.propTypes = {
  wf_module_id:     PropTypes.number
};
/* NPM modules */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withSnackbar } from 'notistack';
/* Material UI */
import Container from '@material-ui/core/Container';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
/* Own modules */
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import NodepopAPI from '../../services/NodepopAPI';
import UserConsumer from '../../context/UserContext';
/* Assets */
import imagePhoto from '../../assets/images/photo.png'
/* CSS */
import './AdvertEdit.css';

/**
 * Main App
 */
class AdvertEdit extends Component {

  /**
   * Utilizar el contexto en cualquier metodo del ciclo de vida del component
   */
  static contextType = UserConsumer;

  /**
   * Constructor
   */
  constructor(props) {
    super(props)
    this.state = {
      photoTemp: '',
      openModal: false,
      api: new NodepopAPI(),
      tags: [],
      advert: {
        type: '',
        tags: [],
        photo: '',
        name: '',
        description: '', 
      }
    }
  }

  /**
   * Component did mount
   */
  componentDidMount() {
    // Chequeo sesion del contexto, si no existe redirijo a register
    const session = this.context.session
    if (!session) {
      return this.props.history.push('/register');
    } 
    // Obtengo los tags y los paso al estado para que re-renderice el panel de busquedas
    this.state.api.getTags().then(res => {
      this.setState({tags: res})
    });
    // En caso de ser una modificación cargo el anuncio a editar
    if (this.props.mode === 'edit' && this.props.match.params) {
      const id = this.props.match.params.id;
      this.state.api.getAdvert(id)
        .then( res => {
          this.setState({
            advert: res,
            loading: false
          });
        }) 
    }
  }

  /**
   * Render
   */
  render() {
    return (
      <React.Fragment>
        <Header handleSearch={this.handleSearch}/>
        <Container>
          <main className='AdvertEdit'>
            <div className='SectionTitle'>
              <h2>{this.props.mode === 'edit' ? 'Editar anuncio' : 'Crear nuevo anuncio' }</h2>
            </div>
            <form onSubmit={this.handleSubmit} noValidate autoComplete='off' className='AdvertEdit__Form'>
              <button className='AdvertEdit_Picture' onClick={this.handleSwitchOpen}>
                <img src={this.state.advert.photo || imagePhoto} alt='dummy_photo'/>
              </button>
              <FormControl fullWidth className='AdvertEdit__FormControl'>
                <InputLabel shrink htmlFor='type'>Tipo</InputLabel>
                <Select
                  name= 'type'
                  onChange={this.handleChange('type')}
                  className='SearchPanel__Type'
                  value={this.state.advert.type}
                  displayEmpty
                >
                  <MenuItem key='buy' value='buy'><Chip size='small' label='buy' className='AdvertCard__Tag AdvertCard__Tag--small AdvertCard__Tag--buy'/></MenuItem>
                  <MenuItem key='sell' value='sell'><Chip size='small' label='sell' className='AdvertCard__Tag AdvertCard__Tag--small AdvertCard__Tag--sell'/></MenuItem>                  
                </Select>
              </FormControl>
              <FormControl fullWidth className='AdvertEdit__FormControl'>
                <InputLabel shrink htmlFor='tags'>Tags</InputLabel>
                <Select
                  multiple
                  name='tags'
                  value={this.state.advert.tags || ''}
                  onChange={this.handleChangeMultiple}
                  renderValue={this.renderValue}
                >
                  {
                    this.state.tags && 
                    this.state.tags.map((value, key) => {
                      return  <MenuItem key={key} value={value}>
                                <Chip key={key}
                                      size='small'
                                      label={value}
                                      className={`AdvertCard__Tag AdvertCard__Tag--small AdvertCard__Tag--${value}`}
                                />
                              </MenuItem>
                    })
                  }
                </Select>
              </FormControl>
              <FormControl fullWidth className='AdvertEdit__FormControl'>
                <InputLabel htmlFor='priceFrom'>Price</InputLabel>
                <Input
                  name='price'
                  value={parseInt(this.state.advert.price) || ''}
                  onChange={this.handleChange('price')}
                  endAdornment={<InputAdornment position='start'>€</InputAdornment>}
                />
              </FormControl>
              <FormControl fullWidth className='AdvertEdit__FormControl'>
                <TextField
                  name='description'
                  label='Descripción'
                  value={this.state.advert.description}
                  onChange={this.handleChange('description')}
                  multiline
                  rows={2}
                  helperText='Introduce una descripción para el anuncio'
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl> 
              <div className='AdvertEdit__Footer'>
                <Button className='button' type='submit' variant='contained' color='primary'>Aceptar</Button>
                <Link to='/' className='LinkBlock'>
                  <Button className='button' variant='contained' color='secondary' onClick={this.handleReset}>Cancel</Button>
                </Link>
              </div>            
            </form>
          </main>
          <Dialog open={this.state.openModal} className='AdvertEdit__Modal'>
            <DialogTitle className='Modal_Title'>
              URL de la imagen
            </DialogTitle>
            <DialogContent className='Modal__Content'>
              <DialogContentText>
                La API de nodepop no admite carga de imagenes locales por el momento. Por favor, indique la URL a la imagen que desea añadir al anuncio
              </DialogContentText>
              <TextField
                autoFocus
                name='photoTemp'
                value={this.state.photoTemp}
                onChange={(ev)=>{this.setState({photoTemp: ev.target.value})}}
                margin='dense'
                label='URL Imagen'
                type='text'
                fullWidth
              />
            </DialogContent>
            <DialogActions className='Modal__Actions'>
              <Button onClick={this.handleChangePhoto} variant='contained'  color='primary'>
                Aceptar
              </Button>
              <Button onClick={this.handleSwitchOpen} variant='contained' color='secondary'>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
        <Footer/>
      </React.Fragment>
    );
  }

  /**
   * Cambio en un input tipo texto
   */
  handleChange = field => event => {
    const aux = this.state.advert;
    aux[field] = event.target.value
    this.setState({
      advert: aux
    });
  }

  /**
   * Selectores de tipo multiple choice
   */
  handleChangeMultiple = event => {
    // Obtengo el estado, actualizo los tags seleccionados
    const aux = this.state.advert;
    aux.tags = event.target.value;
    // Actualizo el estado
    this.setState({advert: aux})
  };

  /**
   * Manejador del submit del formulario
   */
  handleSubmit = (ev) => {
    ev.preventDefault();
  }

  /**
   * Handle open modal
   */
  handleSwitchOpen = () => {
    this.setState({
      photoTemp: this.state.advert.photo,
      openModal: !this.state.openModal
    });
  }

  /**
   * Hanle close modal
   */
  handleChangePhoto = () => {
    // Actualizo la imagen y cierro el modal
    if (this.state.photoTemp) {
      const aux = this.state.advert;
      aux.photo = this.state.photoTemp;
      this.setState({
        advert: aux,
        openModal: false
      }); 
    } else {
      this.props.enqueueSnackbar('Debe indicar una URL a una imagen primero', { variant: 'error' });
    }
  }

  renderValue = () => {
    if (this.state.advert.tags) {
      return (
        <div> 
        { this.state.advert.tags.map(value => 
          <Chip key={value} size='small' label={value} className={`AdvertCard__Tag AdvertCard__Tag--small AdvertCard__Tag--${value}`}/> 
        )}
        </div>
      );        
    }
    return <div></div>;
  }
}

export default withSnackbar(AdvertEdit);
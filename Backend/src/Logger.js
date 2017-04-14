/**
 * @author Anthony Altieri on 4/7/17.
 */

import bunyan from 'bunyan';
import moment from 'moment';

const reqPostSerializer = (reqPost) => {
  let session;
  if (!!reqPost.session)
    session: reqPost.session;

  return {
    url: reqPost.url,
    body: reqPost.body,
    session,
  }
};

const errorSerializer = ({ type, description, stackTrace }) => {
  return {
    stackTrace,
    type,
    description,
  }
};


export const createLogger = () => bunyan
  .createLogger({
    name: 'Schwifty',
    date: moment().format('MMMM Do YYYY, h:mm:ss a'),
    serializers: {
      reqPost: reqPostSerializer,
      error: errorSerializer,
    }
  });


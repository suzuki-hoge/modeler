use std::future::Future;
use std::pin::Pin;

use actix_service::Service;
use actix_web::body::{BoxBody, EitherBody};
use actix_web::{dev::ServiceRequest, dev::ServiceResponse, Error};

use crate::logger;

#[allow(clippy::type_complexity)]
pub fn log_middleware<S>(
    req: ServiceRequest,
    srv: &S,
) -> Pin<Box<dyn Future<Output = Result<ServiceResponse<EitherBody<BoxBody>>, Error>>>>
where
    S: Service<ServiceRequest, Response = ServiceResponse<EitherBody<BoxBody>>, Error = Error> + 'static,
{
    let uri = req.uri().to_string();
    let user_id = req
        .headers()
        .get("Modeler-User-Id")
        .ok_or("no-token")
        .and_then(|header| header.to_str().map_err(|_| "invalid-token"))
        .map(|s| s.to_string())
        .unwrap_or_else(|message| message.to_string());

    logger::http_start(&user_id, uri);

    let fut = srv.call(req);

    Box::pin(async move {
        let res: ServiceResponse<EitherBody<BoxBody>> = fut.await?;
        let status = res.status();

        logger::http_end(&user_id, status.as_u16());

        Ok(res)
    })
}

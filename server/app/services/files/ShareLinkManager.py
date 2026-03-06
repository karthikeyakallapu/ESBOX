import secrets
from datetime import datetime, timedelta, UTC, timezone

from fastapi import HTTPException

from app.config import settings
from app.helpers.auth import hash_password, verify_password
from app.logger import logger
from app.repositories.file import file_repository
from app.repositories.sharefile import share_file_repository
from app.services.files.file_stream_manager import file_stream_manager


class ShareLinkManager:
   @staticmethod
   async def create_share_link(share, user_id, db):
        try:

            existing_link = await share_file_repository.get_link_by_file_and_user(share.file_id, user_id, db)

            if existing_link :
               existing_link.expires_at = datetime.now(timezone.utc) + timedelta(hours=share.expire_in_hours)
               existing_link.password_hash = hash_password(share.password)
               await db.commit()
               await db.refresh(existing_link)
               return {
                        "shareable_link": f"{settings.frontend_url}/s/{existing_link.share_token}"
                }

            file = await file_repository.get_file_by_id(share.file_id,  db)

            if not file:
                raise HTTPException(status_code=404, detail="File not found")

            share_token = secrets.token_urlsafe(16)
            password =  share.password
            password_hash = None

            if password:
                password_hash = hash_password(password)

            link = await share_file_repository.add_link({
                "file_id": share.file_id,
                "created_by": user_id,
                "share_token": share_token,
                "password_hash": password_hash,
                "expires_at": datetime.now(UTC) + timedelta(hours=share.expire_in_hours)
            }, db)

            if link :
                return {
                 "shareable_link": f"{settings.frontend_url}/s/{share_token}"
                }

            return None

        except HTTPException as e:
            logger.error(e)
            raise e
        except Exception as e:
            logger.error(e)
            raise e

   @staticmethod
   async def verify_share_link(share_token, password :str , db):
       try:
           link = await share_file_repository.get_link(share_token,db)

           if link.expires_at and link.expires_at < datetime.now(timezone.utc):
               raise HTTPException(412,"Share link expired")

           if not link:
               raise HTTPException(404, "Link not found")

           if link.password_hash:
               if not verify_password(password, link.password_hash):
                   raise HTTPException(412, "Invalid password")

           file = await file_repository.get_file_by_id(link.file_id, db)

           if not file:
                raise HTTPException(404, "File not found")

           return file

       except HTTPException as e:
           logger.error(e)
           raise e
       except Exception as e:
           logger.error(e)
           raise e

   @staticmethod
   async def stream_shared_file(share_token, range_header, db):
         try:
              share_link = await share_file_repository.get_link(share_token,db)

              if not share_link:
                raise HTTPException(404, "Link not found")

              if share_link.expires_at and share_link.expires_at < datetime.now(timezone.utc):
                  raise HTTPException(412, "Share link expired")

              file = await file_repository.get_file_by_id(share_link.file_id, db)

              if not file:
                 raise HTTPException(404, "File not found")

              stream_response = await file_stream_manager.stream_file(file.id, None, db, range_header)
              return stream_response

         except HTTPException as e:
              logger.error(e)
              raise e
         except Exception as e:
              logger.error(e)
              raise e

   @staticmethod
   async def get_share_links(user_id :int,  db):
        try:
            links = await share_file_repository.get_links_by_user(user_id, db)
            return links
        except HTTPException as e:
            logger.error(e)
            raise e
        except Exception as e:
            logger.error(e)
            raise e

   @staticmethod
   async def delete_share_link(share_token, user_id, db):
        try:
            link = await share_file_repository.get_link(share_token, db)

            if not link:
                raise HTTPException(404, "Link not found")

            if link.created_by != user_id:
                raise HTTPException(403, "Access denied")

            await db.delete(link)
            await db.commit()
            return {"message": "Share link deleted"}
        except HTTPException as e:
            logger.error(e)
            raise e
        except Exception as e:
            logger.error(e)
            raise e

   @staticmethod
   async def update_share_link(share_token, share, user_id, db):
        try:
            link = await share_file_repository.get_link(share_token, db)

            if not link:
                raise HTTPException(404, "Link not found")

            if link.created_by != user_id:
                raise HTTPException(403, "Access denied")

            if share.expire_in_hours:
                link.expires_at = datetime.now(timezone.utc) + timedelta(hours=share.expire_in_hours)

            if share.password is not None:
                link.password_hash = hash_password(share.password)

            await db.commit()
            await db.refresh(link)
            return link

        except HTTPException as e:
            logger.error(e)
            raise e
        except Exception as e:
            logger.error(e)
            raise e



share_link_manager = ShareLinkManager()
import KysoTopBar from '@/layouts/KysoTopBar';
import { KBreadcrumb, KCodeRenderer } from '@kyso-io/kcomponents';

const Index = () => {
  const navigationTest = [
    {
      name: 'hola',
      href: 'https://marca.com',
      current: false,
    },
    {
      name: 'caracola',
      href: 'https://marca.com',
      current: false,
    },
    {
      name: 'pepsicola',
      href: 'https://marca.com',
      current: true,
    },
  ];

  return (
    <>
      <KBreadcrumb navigation={navigationTest}></KBreadcrumb>

      <KCodeRenderer
        code={`
package com.nexica.cloud.persistence.panel.dao;

import com.nexica.cloud.model.commons.util.CheckNull;
import com.nexica.cloud.model.panel.dto.PanelUserDTO;
import com.nexica.cloud.model.panel.entity.PanelUsers;
import com.nexica.cloud.model.panel.entity.PanelUsers_;
import com.nexica.cloud.persistence.commons.GenericDAO;
import com.nexica.cloud.persistence.commons.IPersistenceContext;
import com.nexica.cloud.persistence.commons.PersistenceJPAUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import javax.persistence.*;
import java.util.Collections;
import java.util.List;

@Repository
public class PanelUsersDAO extends GenericDAO<PanelUsers, Integer> {

    private static final Logger LOGGER = LoggerFactory.getLogger(PanelUsersDAO.class);
    private String FIND_BY_ID;
    private String GET_PASSWORD_BY_EMAIL;
    private String GET_PORTRAIT_BY_USER_ID;

    @Autowired
    public PanelUsersDAO(IPersistenceContext context) {
        this(context.getEntityManagerFactory());
    }

    private PanelUsersDAO(EntityManagerFactory emf) {
        this.emf = emf;
    }


    @Override
    @PostConstruct
    public void init() {
        LOGGER.info("########## Initializating PanelUsersDAO");
        PersistenceJPAUtil.initializeDAO(this);
    }

    @Override
    public boolean exists(PanelUsers object) {
        return this.getByPK(object.getId()) != null;
    }

    @Override
    public PanelUsers getByPK(Integer id) {
        EntityManager em = null;

        try {
            em = this.getEntityManager();

            TypedQuery<PanelUsers> query =
                    em.createQuery(this.FIND_BY_ID, PanelUsers.class);

            query.setParameter("userIdParam", id);

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        } catch (Exception ex) {
            LOGGER.error(this.FIND_BY_ID, ex);
            return null;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public PanelUserDTO findByEmail(String email) {
        EntityManager em = null;

        try {
            em = this.getEntityManager();

            TypedQuery<PanelUserDTO> query
                    = em.createNamedQuery(PanelUserDTO.NATIVE_QUERY_FIND_BY_EMAIL, PanelUserDTO.class);

            query.setParameter("emailParam", email);

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        } catch (Exception ex) {
            LOGGER.error(PanelUserDTO.NATIVE_QUERY_FIND_BY_EMAIL, ex);
            return null;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public PanelUserDTO findById(int id) {
        EntityManager em = null;

        try {
            em = this.getEntityManager();

            TypedQuery<PanelUserDTO> query
                    = em.createNamedQuery(PanelUserDTO.NATIVE_QUERY_FIND_BY_ID, PanelUserDTO.class);

            query.setParameter("userIdParam", id);

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        } catch (Exception ex) {
            LOGGER.error(PanelUserDTO.NATIVE_QUERY_FIND_BY_ID, ex);
            return null;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public List<PanelUserDTO> findByOrganizationName(String organizationName) {
        EntityManager em = null;

        try {
            em = this.getEntityManager();

            TypedQuery<PanelUserDTO> query
                    = em.createNamedQuery(PanelUserDTO.NATIVE_QUERY_FIND_BY_ORGANIZATION_NAME, PanelUserDTO.class);

            query.setParameter("organizationNameParam", organizationName);

            return query.getResultList();
        } catch (NoResultException ex) {
            return Collections.emptyList();
        } catch (Exception ex) {
            LOGGER.error(PanelUserDTO.NATIVE_QUERY_FIND_BY_ORGANIZATION_NAME, ex);
            return Collections.emptyList();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public List<PanelUserDTO> findAllActiveUsers() {
        EntityManager em = null;

        try {
            em = this.getEntityManager();

            TypedQuery<PanelUserDTO> query
                    = em.createNamedQuery(PanelUserDTO.NATIVE_QUERY_FIND_ALL_BY_ACTIVE, PanelUserDTO.class);

            return query.getResultList();
        } catch (NoResultException ex) {
            return Collections.emptyList();
        } catch (Exception ex) {
            LOGGER.error(PanelUserDTO.NATIVE_QUERY_FIND_ALL_BY_ACTIVE, ex);
            return Collections.emptyList();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public String getUserEncryptedPassword(String email) {
        EntityManager em = null;

        try {
            em = this.getEntityManager();

            Query query = em.createNativeQuery(this.GET_PASSWORD_BY_EMAIL);

            query.setParameter("emailParam", email);

            return (String)query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        } catch (Exception ex) {
            LOGGER.error(this.GET_PASSWORD_BY_EMAIL, ex);
            return null;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public byte[] getPicture(int userId) {
        EntityManager em = null;

        try {
            em = this.getEntityManager();

            Query query = em.createNativeQuery(this.GET_PORTRAIT_BY_USER_ID);

            query.setParameter("idParam", userId);

            return (byte[])query.getSingleResult();
        } catch (NoResultException ex) {
            return CheckNull.BYTE_ARRAY_DEFAULT_VALUE;
        } catch (Exception ex) {
            LOGGER.error(this.GET_PORTRAIT_BY_USER_ID, ex);
            return CheckNull.BYTE_ARRAY_DEFAULT_VALUE;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }


    @Override
    public void initMetamodelQueries() {
        this.FIND_BY_ID = String.format(
                "SELECT a FROM %s a WHERE a.%s = :userIdParam",
                PanelUsers.class.getSimpleName(),
                PanelUsers_.id.getName()
        );

        this.GET_PASSWORD_BY_EMAIL = "SELECT password FROM panel_users WHERE TRIM(LOWER(email)) = TRIM(LOWER(#emailParam))";
        this.GET_PORTRAIT_BY_USER_ID = "SELECT picture FROM panel_users WHERE id = #idParam";

    }
}
          `}
      ></KCodeRenderer>
    </>
  );
};

Index.layout = KysoTopBar;

export default Index;

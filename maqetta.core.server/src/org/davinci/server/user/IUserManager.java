package org.davinci.server.user;

import java.io.File;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface IUserManager {

    public abstract boolean hasPermisions(IUser owner, IUser requester, String resource);
    
    public IUser authenticate(HttpServletRequest req, HttpServletResponse resp);

    public abstract IUser getUser(String userName);

    public abstract IUser addUser(String userName, String password, String email) throws UserException;

    public abstract void removeUser(String userName) throws UserException;

    public abstract IUser login(String userName, String password);

    public abstract boolean isValidUser(String userName);

    public IUser getSingleUser();

    public IUser newUser(IPerson p, File f );
}
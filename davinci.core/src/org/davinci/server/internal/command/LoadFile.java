package org.davinci.server.internal.command;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedInputStream;
import javax.servlet.http.HttpServletResponse;

import org.davinci.server.Command;
import org.davinci.server.IVResource;
import org.davinci.server.user.User;

public class LoadFile extends Command {

	@Override
	public void handleCommand(HttpServletRequest req, HttpServletResponse resp,	User user) throws IOException {
		String path=req.getParameter("path");
		
		IVResource file = user.getResource(path);
		
		if (file.exists()){
			InputStream is=new BufferedInputStream(file.getInputStreem());
			transferStreams(is, resp.getOutputStream(), true);
		}else{
			resp.sendError(HttpServletResponse.SC_NOT_FOUND);
		}
		
	}



}
